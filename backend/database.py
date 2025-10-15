"""
Database connection and operations
"""
import pyodbc
from config import settings

class Database:
    def __init__(self):
        self.connection_string = settings.SQL_CONNECTION_STRING
    
    def get_connection(self):
        """Create and return database connection"""
        try:
            conn = pyodbc.connect(self.connection_string)
            return conn
        except Exception as e:
            raise Exception(f"Database connection failed: {str(e)}")
    
    def execute_query(self, query: str, params: tuple = ()):
        """Execute a SELECT query and return results"""
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(query, params)
            results = cursor.fetchall()
            return results
        finally:
            cursor.close()
            conn.close()
    
    def execute_update(self, query: str, params: tuple = ()):
        """Execute INSERT/UPDATE/DELETE query"""
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(query, params)
            conn.commit()
            return cursor.rowcount
        finally:
            cursor.close()
            conn.close()
    
    def execute_insert_with_identity(self, query: str, params: tuple = ()):
        """Execute INSERT and return the identity (ID)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(query, params)
            cursor.execute("SELECT @@IDENTITY")
            identity = cursor.fetchone()[0]
            conn.commit()
            return int(identity)
        finally:
            cursor.close()
            conn.close()

db = Database()