const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const db = require('./vt.js');

class MySQLDatabase {
    static HOST = 'localhost'; // örneğin, 'localhost'
    static USER = 'vanderpoldatabase'; // örneğin, 'root'
    static PASSWORD = 'vanderpoldatabase'; // örneğin, 'password'
    static DATABASE = 'vanderpoldatabase'; // örneğin, 'test'
    static PORT = '3306';

    constructor() {
        this.connection = null;
    }

    async connect() {
        this.connection = await mysql.createConnection({
            host: MySQLDatabase.HOST,
            user: MySQLDatabase.USER,
            password: MySQLDatabase.PASSWORD,
            database: MySQLDatabase.DATABASE,
            port: MySQLDatabase.PORT,
            timezone: 'Europe/Istanbul'
        });
    }

    async query(sql, params = []) {
        try {
            // Parametrelerin uygun türde olup olmadığını kontrol et
            const checkedParams = params.map(param => {
                if (typeof param === 'number' || typeof param === 'string') {
                    return param;
                } else {
                    throw new TypeError("Invalid parameter type, must be number or string");
                }
            });
    
            await this.connect();
            const [rows] = await this.connection.execute(sql, checkedParams);
            return rows || [];
        } catch (error) {
            this.logError(MySQLDatabase.DATABASE, error.message + " - Query: " + sql);
            return [];
        } finally {
            if (this.connection) {
                await this.connection.end();
            }
        }
    }
    
    async insert(table, data) {
        try {
            const columns = Object.keys(data).join(', ');
            const placeholders = Object.keys(data).fill('?').join(', ');
            const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
            const params = Object.values(data);
            const result = await this.query(sql, params);
            return result.insertId || null; // insertId yoksa null döndür
        } catch (error) {
            this.logError(MySQLDatabase.DATABASE, error.message + " - Data: " + JSON.stringify(data));
            return null;
        }
    }

    async update(table, whereColumn, whereValue, data) {
        try {
            const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
            const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereColumn} = ?`;
            const params = [...Object.values(data), whereValue];
            const result = await this.query(sql, params);
            return result.affectedRows || 0; // affectedRows yoksa 0 döndür
        } catch (error) {
            this.logError(MySQLDatabase.DATABASE, error.message + " - Data: " + JSON.stringify(data));
            return 0;
        }
    }

    async delete(table, whereColumn, whereValue) {
        try {
            const sql = `DELETE FROM ${table} WHERE ${whereColumn} = ?`;
            const params = [whereValue];
            const result = await this.query(sql, params);
            return result.affectedRows || 0; // affectedRows yoksa 0 döndür
        } catch (error) {
            this.logError(MySQLDatabase.DATABASE, error.message + " - Query: " + sql);
            return 0;
        }
    }

    logError(db, message) {
        const logDirectory = '/www/wwwroot/mysqlerrorlog';
        const timestamp = new Date().toISOString();
        const errorMessage = `[${timestamp}] Hata: ${message}\n`;

        if (!fs.existsSync(logDirectory)) {
            fs.mkdirSync(logDirectory);
        }

        const logFile = path.join(logDirectory, `error_${db}.txt`);
        fs.appendFileSync(logFile, errorMessage);
    }
}

module.exports = new MySQLDatabase();
