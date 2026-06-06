-- Create Servers table
CREATE TABLE IF NOT EXISTS servers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT
);

-- Join table to track task status per server
CREATE TABLE IF NOT EXISTS server_tasks (
    id SERIAL PRIMARY KEY,
    server_id INTEGER REFERENCES servers(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(server_id, task_id)
);

-- Seed Initial 11 Tasks
INSERT INTO tasks (id, title, description) VALUES
(1, 'Update & Patch Management', 'Regularly update OS, apps, and firmware.'),
(2, 'Secure Configuration', 'Disable unnecessary services and features.'),
(3, 'User Accounts & Privileges', 'Implement PoLP and MFA.'),
(4, 'File System Security', 'Encrypt data and configure file permissions.'),
(5, 'Network Security', 'Configure secure networks and segmentation.'),
(6, 'Malware Protection', 'Install and configure antivirus software.'),
(7, 'Backup & Recovery', 'Establish backup strategies.'),
(8, 'Monitoring & Logging', 'Enable system logging and IDS/IPS.'),
(9, 'Security Policies & Procedures', 'Develop enforce policies.'),
(10, 'Regular Security Audits', 'Conduct vulnerability assessments.'),
(11, 'Continual Improvement', 'Stay updated with advisories.')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to ensure future inserts don't conflict
SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));

-- Create Default "Local Environment" server
INSERT INTO servers (name) VALUES ('Local Environment') ON CONFLICT (name) DO NOTHING;

-- Assign all tasks to the default server as incomplete
INSERT INTO server_tasks (server_id, task_id, is_completed)
SELECT 
    (SELECT id FROM servers WHERE name = 'Local Environment'),
    id,
    false
FROM tasks
ON CONFLICT (server_id, task_id) DO NOTHING;
