const sql = require('mssql');
const config = require('./config.json');

let pool;

async function connectToDatabase() {
    if (!pool) {
        try {
            pool = await sql.connect(config.sqlConfig);
            console.log('Connected to SQL Server');
        } catch (err) {
            console.error('SQL Server connection error:', err);
        }
    }
    return pool;
}

module.exports = {
    connectToDatabase
};