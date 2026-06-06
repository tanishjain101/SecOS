require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Get all servers
app.get('/api/servers', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM servers ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new server
app.post('/api/servers', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Server name is required' });

    try {
        const result = await db.query('INSERT INTO servers (name) VALUES ($1) RETURNING *', [name]);
        const serverId = result.rows[0].id;

        // Auto-assign all tasks as false
        const tasks = await db.query('SELECT id FROM tasks');
        for (let task of tasks.rows) {
            await db.query(
                'INSERT INTO server_tasks (server_id, task_id, is_completed) VALUES ($1, $2, false) ON CONFLICT DO NOTHING',
                [serverId, task.id]
            );
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Server name already exists' });
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get progress for a server
app.get('/api/progress/:serverId', async (req, res) => {
    const { serverId } = req.params;
    try {
        const result = await db.query(`
            SELECT t.id as task_id, t.title, st.is_completed 
            FROM tasks t
            LEFT JOIN server_tasks st ON t.id = st.task_id AND st.server_id = $1
            ORDER BY t.id ASC
        `, [serverId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update progress for a task
app.put('/api/progress/:serverId/:taskId', async (req, res) => {
    const { serverId, taskId } = req.params;
    const { is_completed } = req.body;
    
    try {
        await db.query(`
            INSERT INTO server_tasks (server_id, task_id, is_completed) 
            VALUES ($1, $2, $3)
            ON CONFLICT (server_id, task_id) 
            DO UPDATE SET is_completed = $3
        `, [serverId, taskId, is_completed]);
        
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
