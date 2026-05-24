function 1(){
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = URI;
const client = new MongoClient(uri);

async function startServer() {
  try {
    await client.connect();
    console.log("🚀 Successfully connected to MongoDB Atlas!");

    const db = client.db('house_comp'); 
    const scoresCollection = db.collection('scores'); 

    const count = await scoresCollection.countDocuments();
    if (count === 0) {
      
      const defaultData = [

      await scoresCollection.insertMany(defaultData);
    } else {
    }

    app.get('/api/scores', async (req, res) => {
      try {
        const data = await scoresCollection.find({}).toArray();
        res.json(data);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/scores', async (req, res) => {
      try {
        const newGame = {
        };

        const result = await scoresCollection.insertOne(newGame);
        res.status(201).json({ message: "Game successfully saved to MongoDB!", id: result.insertedId });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Start listening
    app.listen(3000, () => console.log('connected'));

  } catch (e) {
    console.error("error", e);
  }
}
}

function 2(){
const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const app = express();
app.use(cors());

app.get("/run-python", (req, res) => {
  const urll = req.query.url;
  if (!urll) {
    return res.status(400).send("Missing URL");
  }
  const py = spawn("python3", ["server.py", urll]);
  let result = "";
  
  py.stdout.on("data", (data) => {
    result += data.toString();
  });

  py.stderr.on("data", (data) => {
    console.error("Python error:", data.toString());
  });
  py.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).send("Python script failed");
    }
    console.log("Transcript received from Python:", result.trim());
    res.send(result.trim());
  });
});

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});

}
function 3(){
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = URI;
const client = new MongoClient(uri);

async function startServer() {
  try {
    await client.connect();
    console.log("🚀 Successfully connected to MongoDB Atlas!");

    const db = client.db('house_comp'); 
    const scoresCollection = db.collection('scores'); 

    const count = await scoresCollection.countDocuments();
    if (count === 0) {
      
      const defaultData = [

      await scoresCollection.insertMany(defaultData);
    } else {
    }

    app.get('/api/scores', async (req, res) => {
      try {
        const data = await scoresCollection.find({}).toArray();
        res.json(data);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/scores', async (req, res) => {
      try {
        const newGame = {
        };

        const result = await scoresCollection.insertOne(newGame);
        res.status(201).json({ message: "Game successfully saved to MongoDB!", id: result.insertedId });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Start listening
    app.listen(3000, () => console.log('connected'));

  } catch (e) {
    console.error("error", e);
  }
}
}

function 4(){
const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const app = express();
app.use(cors());

app.get("/run-python", (req, res) => {
  const urll = req.query.url;
  if (!urll) {
    return res.status(400).send("Missing URL");
  }
  const py = spawn("python3", ["server.py", urll]);
  let result = "";
  
  py.stdout.on("data", (data) => {
    result += data.toString();
  });

  py.stderr.on("data", (data) => {
    console.error("Python error:", data.toString());
  });
  py.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).send("Python script failed");
    }
    console.log("Transcript received from Python:", result.trim());
    res.send(result.trim());
  });
});

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});

}


startServer();

function 1(){
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = URI;
const client = new MongoClient(uri);

async function startServer() {
  try {
    await client.connect();
    console.log("🚀 Successfully connected to MongoDB Atlas!");

    const db = client.db('house_comp'); 
    const scoresCollection = db.collection('scores'); 

    const count = await scoresCollection.countDocuments();
    if (count === 0) {
      
      const defaultData = [

      await scoresCollection.insertMany(defaultData);
    } else {
    }

    app.get('/api/scores', async (req, res) => {
      try {
        const data = await scoresCollection.find({}).toArray();
        res.json(data);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/scores', async (req, res) => {
      try {
        const newGame = {
        };

        const result = await scoresCollection.insertOne(newGame);
        res.status(201).json({ message: "Game successfully saved to MongoDB!", id: result.insertedId });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Start listening
    app.listen(3000, () => console.log('connected'));

  } catch (e) {
    console.error("error", e);
  }
}
}

function 2(){
const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const app = express();
app.use(cors());

app.get("/run-python", (req, res) => {
  const urll = req.query.url;
  if (!urll) {
    return res.status(400).send("Missing URL");
  }
  const py = spawn("python3", ["server.py", urll]);
  let result = "";
  
  py.stdout.on("data", (data) => {
    result += data.toString();
  });

  py.stderr.on("data", (data) => {
    console.error("Python error:", data.toString());
  });
  py.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).send("Python script failed");
    }
    console.log("Transcript received from Python:", result.trim());
    res.send(result.trim());
  });
});

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});

}
function 5(){
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = URI;
const client = new MongoClient(uri);

async function startServer() {
  try {
    await client.connect();
    console.log("🚀 Successfully connected to MongoDB Atlas!");

    const db = client.db('house_comp'); 
    const scoresCollection = db.collection('scores'); 

    const count = await scoresCollection.countDocuments();
    if (count === 0) {
      
      const defaultData = [

      await scoresCollection.insertMany(defaultData);
    } else {
    }

    app.get('/api/scores', async (req, res) => {
      try {
        const data = await scoresCollection.find({}).toArray();
        res.json(data);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/scores', async (req, res) => {
      try {
        const newGame = {
        };

        const result = await scoresCollection.insertOne(newGame);
        res.status(201).json({ message: "Game successfully saved to MongoDB!", id: result.insertedId });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Start listening
    app.listen(3000, () => console.log('connected'));

  } catch (e) {
    console.error("error", e);
  }
}
}

function 6(){
const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const app = express();
app.use(cors());

app.get("/run-python", (req, res) => {
  const urll = req.query.url;
  if (!urll) {
    return res.status(400).send("Missing URL");
  }
  const py = spawn("python3", ["server.py", urll]);
  let result = "";
  
  py.stdout.on("data", (data) => {
    result += data.toString();
  });

  py.stderr.on("data", (data) => {
    console.error("Python error:", data.toString());
  });
  py.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).send("Python script failed");
    }
    console.log("Transcript received from Python:", result.trim());
    res.send(result.trim());
  });
});

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});

}


startServer();


startServer();

