import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { WebSocketServer } from "ws";
import mqtt from "mqtt";
import fs from "fs";
import pg from "pg";
import nodemailer from 'nodemailer';
import bodyParser from "body-parser";




// Email configuration
const emailTransporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: 'ambenard2002@gmail.com', // Replace with your email
    pass: 'kjdzesivgfhpyros'     // Replace with your app password
  }
});
// kjdz esiv gfhp yros


// postgress Db
const db =  new pg.Client({
  user : "postgres",
  host : "localhost",
  database : "sensor_data",
  password : "1124",
  port : 5433
});

db.connect();



// --- Path setup for ES modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Express App Setup ---
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}))
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
const iotEndpoint = "a13eoh8ml0lger-ats.iot.eu-north-1.amazonaws.com";

const mqttOptions = {
  clientId: "express-dashboard-client",
  host: iotEndpoint,
  port: 8883,
  protocol: "mqtts",
  key: fs.readFileSync("./certs/motor_sim.private.key"),
  cert: fs.readFileSync("./certs/motor_sim.cert.pem"),
  ca: fs.readFileSync("./certs/AmazonRootCA1.pem"),
  rejectUnauthorized: true,
};

// --- Connect to AWS IoT Core ---
const mqttClient = mqtt.connect(mqttOptions);

mqttClient.on("connect", () => {
  console.log("✅ Connected to AWS IoT Core");

  // Subscribe to the topic ESP32 is publishing to
  mqttClient.subscribe("sensors/data", (err) => {
    if (err) {
      console.error("❌ Subscription error:", err.message);
    } else {
      console.log("📡 Subscribed to topic: sensors/data");
    }
  });
});

// --- Handle incoming messages from AWS IoT ---
mqttClient.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log("📨 MQTT Data Received:", data);
    broadcast(data); // Send to all connected WebSocket clients

    // Insert into PostgreSQL
    const query = `
      INSERT INTO sensor_recordings (
        ref_voltage, humidity, ext_temp, ds18b20_temp, mlx_objtemp, mlx_ambtemp,
        motor_volt, motor_curr, motor_power, energy, frequency, powerfactor,
        apparent_power, reactive_power, phase_angle, sync_speed, slip, rotor_speed,
        torque, efficiency, load_factor, vibration_index
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22
      )
    `;

    const values = [
      data['Ref Voltage'], data['Humidity'], data['Ext Temp'], data['DS18B20 Temp'],
      data['MLX ObjTemp'], data['MLX AmbTemp'], data['Motor Volt'], data['Motor Curr'],
      data['Motor Power'], data['Energy'], data['Frequency'], data['PowerFactor'],
      data['Apparent Power'], data['Reactive Power'], data['Phase Angle'], data['Sync Speed'],
      data['Slip'], data['Rotor Speed'], data['Torque'], data['Efficiency'],
      data['Load Factor'], data['Vibration Index']
    ];
    
    db.query(query,values);
    
    console.log("✅ Data saved to PostgreSQL");

  } catch (err) {
    console.error("❌ Error parsing message:", err.message);
  }
});




// websocket listener for frontend commands
wss.on("connection", (ws)=>{
  console.log("client connected")


  ws.on("message", (message)=>{
    try{
      const command = JSON.parse(message.toString());
      console.log("Command from frontend:", command);


      // Publish command to AWS IoT Core
      mqttClient.publish(
        "motor/control",
        JSON.stringify(command),
        {qos:0},
        (err)=>{
          if (err){
            console.log("❌ Error publishing to AWS IoT:", err)
          }else{
            console.log("Command Published to AWS IoT:", command);
          }
      })
    }catch(err){
      console.error("❌ Error handling WS message:", err)
    }
  })
})





// Fetch aggregated historical sensor data
app.get("/history", async (req, res) => {
  try {
    const { parameter, range } = req.query;
    console.log(parameter, range)
    // Validate query parameters
    if (!parameter || !range) {
      return res.status(400).json({ error: "parameter and range are required" });
    }

    // Time range and aggregation bucket size
    let minutes, bucket;
    switch (range) {
      case "1h":  minutes = 60;         bucket = "1 minute"; break;
      case "6h":  minutes = 6 * 60;     bucket = "5 minutes"; break;
      case "24h": minutes = 24 * 60;    bucket = "15 minutes"; break;
      case "7d":  minutes = 7 * 24 * 60; bucket = "1 hour"; break;
      default:    minutes = 60;         bucket = "1 minute";
    }

    // Map parameter from frontend to DB column
    const columnMap = {
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

    const dbColumn = columnMap[parameter];
    if (!dbColumn) {
      return res.status(400).json({ error: "Invalid parameter" });
    }

    // Query aggregated data
    const query = `
      SELECT 
        date_trunc('${bucket.includes("hour") ? "hour" : "minute"}', recorded_at) AS time_bucket,
        ROUND(AVG(${dbColumn})::numeric, 2) AS value
      FROM sensor_recordings
      WHERE recorded_at >= NOW() - INTERVAL '${minutes} minutes'
      GROUP BY time_bucket
      ORDER BY time_bucket ASC
    `;

    const result = await db.query(query);

    res.json(result.rows);

  } catch (err) {
    console.error("❌ Error fetching history:", err);
    res.status(500).json({ error: "Server error" });
  }
});





// Test email route
app.post("/test-email", async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    console.log(req.body)
    const mailOptions = {
      from: 'ambenard2002@gmail.com', // Replace with your email
      to: to || 'bensbusiness520@gmail.com', // Default recipient
      subject: subject || 'Test Email from Sensor System',
      html: `
        <h2>🧪 Test Email</h2>
        <p>${message || 'This is a test email from your sensor monitoring system!'}</p>
        <p><strong>Time sent:</strong> ${new Date().toLocaleString()}</p>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully');
    
    res.json({ success: true, message: "Email sent successfully!" });
    
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    res.status(500).json({ error: "Failed to send email", details: error.message });
  }
});


// Emergency alert email route
app.post("/emergency-alert", async (req, res) => {
  try {
    const { to, trigger, temperature, timestamp } = req.body;
    console.log(trigger)
    
    const mailOptions = {
      from: 'ambenard2002@gmail.com', // Your email
      to: to || 'bensbusiness520@gmail.com', // Default recipient
      subject: `🚨 EMERGENCY STOP ACTIVATED - Critical Temperature Alert`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
                <h1>🚨 EMERGENCY STOP ACTIVATED</h1>
                <h2>Motor Protection System</h2>
            </div>
            
            <div style="padding: 30px; background: #fef2f2;">
                <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 20px;">
                    <h3 style="color: #991b1b; margin: 0 0 10px 0;">⚠️ Critical Alert Details:</h3>
                    <p><strong>Trigger:</strong> ${trigger} Emergency Stop</p>
                    <p><strong>Temperature:</strong> ${temperature}°C</p>
                    <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
                    <p><strong>Status:</strong> Motor has been automatically stopped</p>
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px;">
                    <h3>🔧 Immediate Actions Taken:</h3>
                    <ul>
                        <li>✅ Motor speed set to 0%</li>
                        <li>✅ Motor power disconnected</li>
                        <li>✅ System logged emergency event</li>
                        <li>✅ Alert notification sent</li>
                    </ul>
                </div>

                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
                    <h3 style="color: #856404;">📋 Recommended Actions:</h3>
                    <ol style="color: #856404;">
                        <li>Check motor and surrounding area for overheating</li>
                        <li>Inspect cooling systems and ventilation</li>
                        <li>Verify sensor calibration</li>
                        <li>Do not restart motor until temperature normalizes</li>
                        <li>Contact maintenance team if issue persists</li>
                    </ol>
                </div>
            </div>

            <div style="background: #6b7280; color: white; padding: 15px; text-align: center; font-size: 12px;">
                This is an automated emergency alert from your motor monitoring system.
                <br>System will remain in emergency mode until manually reset.
            </div>
        </div>
    `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log('🚨 Emergency alert email sent successfully');
    
    res.json({ success: true, message: "Emergency alert sent" });
    
  } catch (error) {
    console.error('❌ Failed to send emergency alert:', error);
    res.status(500).json({ error: "Failed to send emergency alert", details: error.message });
  }
});

// --- Start the server ---
server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});


