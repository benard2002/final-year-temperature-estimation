import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { WebSocketServer } from "ws";
import mqtt from "mqtt";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";

// AWS SDK v3 imports
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

// --- Email configuration ---
const emailTransporter = nodemailer.createTransporter({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- DynamoDB Setup ---
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "sensor-recordings";
const DEVICE_ID = process.env.DEVICE_ID || "esp32-001";

// --- Path setup for ES modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Express App Setup ---
const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

// --- Create HTTP + WebSocket Server ---
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// --- Broadcast to all WebSocket clients ---
function broadcast(data) {
  const json = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(json);
    }
  });
}

// --- AWS IoT MQTT Setup ---
const mqttOptions = {
  clientId: process.env.AWS_IOT_CLIENT_ID,
  host: process.env.AWS_IOT_ENDPOINT,
  port: 8883,
  protocol: "mqtts",
  key: process.env.AWS_IOT_PRIVATE_KEY.replace(/\\n/g, '\n'),
  cert: process.env.AWS_IOT_CERT.replace(/\\n/g, '\n'),
  ca: process.env.AWS_IOT_CA.replace(/\\n/g, '\n'),
  rejectUnauthorized: true
};

// --- Connect to AWS IoT Core ---
const mqttClient = mqtt.connect(mqttOptions);

mqttClient.on("connect", () => {
  console.log("✅ Connected to AWS IoT Core");
  mqttClient.subscribe("sensors/data", err => {
    if (err) console.error("❌ Subscription error:", err.message);
    else console.log("📡 Subscribed to topic: sensors/data");
  });
});

// --- DynamoDB Helper Functions ---
async function saveSensorData(sensorData) {
  const timestamp = Date.now(); // Current timestamp in milliseconds
  
  const item = {
    deviceId: DEVICE_ID,
    timestamp: timestamp,
    recordedAt: new Date().toISOString(),
    
    // Sensor data - exact mapping from your PostgreSQL structure
    ref_voltage: parseFloat(sensorData["Ref Voltage"]) || 0,
    humidity: parseFloat(sensorData["Humidity"]) || 0,
    ext_temp: parseFloat(sensorData["Ext Temp"]) || 0,
    ds18b20_temp: parseFloat(sensorData["DS18B20 Temp"]) || 0,
    mlx_objtemp: parseFloat(sensorData["MLX ObjTemp"]) || 0,
    mlx_ambtemp: parseFloat(sensorData["MLX AmbTemp"]) || 0,
    motor_volt: parseFloat(sensorData["Motor Volt"]) || 0,
    motor_curr: parseFloat(sensorData["Motor Curr"]) || 0,
    motor_power: parseFloat(sensorData["Motor Power"]) || 0,
    energy: parseFloat(sensorData["Energy"]) || 0,
    frequency: parseFloat(sensorData["Frequency"]) || 0,
    powerfactor: parseFloat(sensorData["PowerFactor"]) || 0,
    apparent_power: parseFloat(sensorData["Apparent Power"]) || 0,
    reactive_power: parseFloat(sensorData["Reactive Power"]) || 0,
    phase_angle: parseFloat(sensorData["Phase Angle"]) || 0,
    sync_speed: parseFloat(sensorData["Sync Speed"]) || 0,
    slip: parseFloat(sensorData["Slip"]) || 0,
    rotor_speed: parseFloat(sensorData["Rotor Speed"]) || 0,
    torque: parseFloat(sensorData["Torque"]) || 0,
    efficiency: parseFloat(sensorData["Efficiency"]) || 0,
    load_factor: parseFloat(sensorData["Load Factor"]) || 0,
    vibration_index: parseFloat(sensorData["Vibration Index"]) || 0
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item
  });

  try {
    await docClient.send(command);
    console.log("✅ Data saved to DynamoDB");
    return true;
  } catch (error) {
    console.error("❌ Error saving to DynamoDB:", error);
    return false;
  }
}

async function getHistoricalData(parameter, timeRange) {
  const now = Date.now();
  let startTime, bucketSize;

  // Define time ranges and bucket sizes
  switch (timeRange) {
    case "1h":
      startTime = now - (60 * 60 * 1000); // 1 hour
      bucketSize = 60 * 1000; // 1 minute buckets
      break;
    case "6h":
      startTime = now - (6 * 60 * 60 * 1000); // 6 hours
      bucketSize = 5 * 60 * 1000; // 5 minute buckets
      break;
    case "24h":
      startTime = now - (24 * 60 * 60 * 1000); // 24 hours
      bucketSize = 15 * 60 * 1000; // 15 minute buckets
      break;
    case "7d":
      startTime = now - (7 * 24 * 60 * 60 * 1000); // 7 days
      bucketSize = 60 * 60 * 1000; // 1 hour buckets
      break;
    default:
      startTime = now - (60 * 60 * 1000);
      bucketSize = 60 * 1000;
  }

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "deviceId = :deviceId AND #ts >= :startTime",
    ExpressionAttributeNames: {
      "#ts": "timestamp"
    },
    ExpressionAttributeValues: {
      ":deviceId": DEVICE_ID,
      ":startTime": startTime
    },
    ScanIndexForward: true // Sort by timestamp ascending
  });

  try {
    const result = await docClient.send(command);
    
    // Group data into time buckets and calculate averages
    const buckets = new Map();
    
    result.Items.forEach(item => {
      const bucketTime = Math.floor(item.timestamp / bucketSize) * bucketSize;
      
      if (!buckets.has(bucketTime)) {
        buckets.set(bucketTime, { values: [], count: 0 });
      }
      
      if (item[parameter] !== undefined && item[parameter] !== null) {
        buckets.get(bucketTime).values.push(item[parameter]);
        buckets.get(bucketTime).count++;
      }
    });

    // Calculate averages and format response
    const response = Array.from(buckets.entries())
      .map(([bucketTime, data]) => ({
        time_bucket: new Date(bucketTime).toISOString(),
        value: data.values.length > 0 
          ? Math.round((data.values.reduce((a, b) => a + b, 0) / data.values.length) * 100) / 100
          : 0
      }))
      .sort((a, b) => new Date(a.time_bucket) - new Date(b.time_bucket));

    return response;
  } catch (error) {
    console.error("❌ Error fetching historical data:", error);
    throw error;
  }
}

// --- Handle incoming MQTT messages ---
mqttClient.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log("📨 MQTT Data Received:", data);
    
    // Broadcast to WebSocket clients
    broadcast(data);

    // Save to DynamoDB
    await saveSensorData(data);

  } catch (err) {
    console.error("❌ Error parsing message:", err.message);
  }
});

// --- WebSocket listener for frontend commands ---
wss.on("connection", ws => {
  console.log("Client connected");

  ws.on("message", message => {
    try {
      const command = JSON.parse(message.toString());
      let command_to_send;
      console.log(command);
      
      function trigger_emergency_relay(){
        return {relay5: 0};
      }

      function trigger_relay(speed, relay1_state, relay2_state, relay3_state, relay4_state){
        let command_to_send = {};
        command_to_send.motorSpeed = speed;
        command_to_send.relay1 = relay1_state;
        command_to_send.relay2 = relay2_state;
        command_to_send.relay3 = relay3_state;
        command_to_send.relay4 = relay4_state;
        
        return command_to_send;
      }

      switch (command.motorSpeed) {
        case 0:
          command_to_send = trigger_relay(0,0,0,0,0);            
          break;        
        case 1:
          command_to_send = trigger_relay(1,1,0,0,0);
          break;
        case 2:
          command_to_send = trigger_relay(2,0,1,0,0);       
          break;
        case 3:
          command_to_send = trigger_relay(3,1,0,1,0);
          break;
        case 4:
          command_to_send = trigger_relay(4,1,1,1,0);
          break; 
        case 5:
          command_to_send = trigger_relay(5,0,0,0,1);
          break;
        case 'emergency':
          command_to_send = trigger_emergency_relay();
          break;
        default:
          break;
      }

      console.log(command_to_send, 'Command to send');
      
      mqttClient.publish("motor/control", JSON.stringify(command_to_send), { qos: 0 }, err => {
        if (err) console.log("❌ Error publishing to AWS IoT:", err);
        else console.log("✅ Command Published to AWS IoT:", command_to_send);
      });
    } catch (err) {
      console.error("❌ Error handling WS message:", err);
    }
  });
});

// --- Historical data API ---
app.get("/api/history", async (req, res) => {
  try {
    const { parameter, range } = req.query;
    
    if (!parameter || !range) {
      return res.status(400).json({ error: "parameter and range are required" });
    }

    // Map frontend parameter names to DynamoDB attribute names (matching PostgreSQL structure)
    const parameterMap = {
      refVoltage: "ref_voltage",
      humidity: "humidity", 
      extTemp: "ext_temp",
      ds18b20Temp: "ds18b20_temp",
      mlxObjTemp: "mlx_objtemp",
      mlxAmbTemp: "mlx_ambtemp",
      motorVolt: "motor_volt",
      motorCurr: "motor_curr",
      motorPower: "motor_power",
      energy: "energy",
      frequency: "frequency",
      powerFactor: "powerfactor",
      apparentPower: "apparent_power",
      reactivePower: "reactive_power",
      phaseAngle: "phase_angle",
      syncSpeed: "sync_speed",
      slip: "slip",
      rotorSpeed: "rotor_speed",
      torque: "torque",
      efficiency: "efficiency",
      loadFactor: "load_factor",
      vibrationIndex: "vibration_index"
    };

    const dbParameter = parameterMap[parameter];
    if (!dbParameter) {
      return res.status(400).json({ error: "Invalid parameter" });
    }

    const data = await getHistoricalData(dbParameter, range);
    res.json(data);

  } catch (err) {
    console.error("❌ Error fetching history:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// --- Test DynamoDB connection ---
app.get("/api/test-db", async (req, res) => {
  try {
    const testData = {
      deviceId: DEVICE_ID,
      timestamp: Date.now(),
      recordedAt: new Date().toISOString(),
      testValue: Math.random() * 100
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: testData
    });

    await docClient.send(command);
    res.json({ success: true, message: "DynamoDB connection test successful!", data: testData });
  } catch (error) {
    console.error("❌ DynamoDB test failed:", error);
    res.status(500).json({ error: "DynamoDB connection failed", details: error.message });
  }
});

// --- Get latest sensor data ---
app.get("/api/latest", async (req, res) => {
  try {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "deviceId = :deviceId",
      ExpressionAttributeValues: {
        ":deviceId": DEVICE_ID
      },
      ScanIndexForward: false, // Sort descending to get latest first
      Limit: 1
    });

    const result = await docClient.send(command);
    
    if (result.Items && result.Items.length > 0) {
      res.json(result.Items[0]);
    } else {
      res.json({ message: "No data found" });
    }
  } catch (error) {
    console.error("❌ Error fetching latest data:", error);
    res.status(500).json({ error: "Failed to fetch latest data" });
  }
});

// --- Test email route ---
app.post("/test-email", async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to || process.env.EMAIL_USER,
      subject: subject || "Test Email from Sensor System",
      html: `
        <h2>🧪 Test Email</h2>
        <p>${message || "This is a test email from your sensor monitoring system!"}</p>
        <p><strong>Time sent:</strong> ${new Date().toLocaleString()}</p>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log("✅ Test email sent successfully");
    res.json({ success: true, message: "Email sent successfully!" });

  } catch (error) {
    console.error("❌ Failed to send email:", error);
    res.status(500).json({ error: "Failed to send email", details: error.message });
  }
});

// --- Emergency alert route ---
app.post("/api/emergency-alert", async (req, res) => {
  try {
    const { recipients, trigger, temperature, timestamp, thresholds } = req.body;
    const emailPromises = recipients.map(recipient => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient,
        subject: "🚨 EMERGENCY STOP ACTIVATED - Critical Temperature Alert",
        html: `
          <h1>🚨 EMERGENCY STOP ACTIVATED</h1>
          <p>Trigger: ${trigger}</p>
          <p>Temperature: ${temperature}°C</p>
          <p>Critical Threshold: ${thresholds.critical}°C</p>
          <p>Time: ${new Date(timestamp).toLocaleString()}</p>
          <p>Status: Motor stopped</p>
        `
      };
      return emailTransporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);
    console.log("🚨 Emergency alert emails sent");
    res.json({ success: true, message: "Emergency alerts sent" });

  } catch (error) {
    console.error("❌ Failed to send emergency alerts:", error);
    res.status(500).json({ error: "Failed to send emergency alerts", details: error.message });
  }
});

// --- In-memory system settings ---
let systemSettings = {
  emailAlerts: { enabled: false, recipients: [] },
  temperature: { warningThreshold: 45, criticalThreshold: 50, checkInterval: 2 },
  motorProtection: { autoStop: true, autoStopDelay: 3, cooldownPeriod: 5 },
  dataCollection: { interval: 2, retentionPeriod: 30 }
};

app.get("/api/settings", (req, res) => res.json(systemSettings));

app.post("/api/settings", (req, res) => {
  try {
    systemSettings = { ...systemSettings, ...req.body };
    console.log("💾 Settings updated:", systemSettings);
    res.json({ success: true, message: "Settings saved successfully" });
  } catch (error) {
    console.error("❌ Error saving settings:", error);
    res.status(500).json({ error: "Failed to save settings" });
  }
});

// --- Start server ---
server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📊 DynamoDB Table: ${TABLE_NAME}`);
  console.log(`📱 Device ID: ${DEVICE_ID}`);
});