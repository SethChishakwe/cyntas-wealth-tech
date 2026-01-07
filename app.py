# app.py
from flask import Flask, render_template, request, redirect, url_for, flash, g
import sqlite3
import os
from datetime import datetime
from contextlib import closing

app = Flask(__name__)
app.config['SECRET_KEY'] = 'cyntas-zimbabwe-2023-secret-key'
app.config['DATABASE'] = 'cyntas.db'

# Database helper functions
def get_db():
    """Get database connection"""
    if 'db' not in g:
        g.db = sqlite3.connect(app.config['DATABASE'])
        g.db.row_factory = sqlite3.Row  # Return rows as dictionaries
    return g.db

def init_db():
    """Initialize the database with tables"""
    with app.app_context():
        db = get_db()
        
        # Create users table
        db.execute('''
            CREATE TABLE IF NOT EXISTS user (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                location TEXT NOT NULL,
                interest_area TEXT NOT NULL,
                investment_level TEXT NOT NULL,
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create workshop registrations table
        db.execute('''
            CREATE TABLE IF NOT EXISTS workshop_registration (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                workshop_type TEXT NOT NULL,
                payment_method TEXT NOT NULL,
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        db.commit()
        print("✅ Database initialized successfully")

@app.teardown_appcontext
def close_db(error):
    """Close database connection at the end of request"""
    if hasattr(g, 'db'):
        g.db.close()

# Initialize database on startup
with app.app_context():
    init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/education')
def education():
    return render_template('education.html')

@app.route('/micro-investing')
def micro_investing():
    return render_template('micro_investing.html')

@app.route('/diaspora')
def diaspora():
    return render_template('diaspora.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        try:
            first_name = request.form['first_name']
            last_name = request.form['last_name']
            email = request.form['email']
            phone = request.form['phone']
            location = request.form['location']
            interest_area = request.form['interest_area']
            investment_level = request.form['investment_level']
            
            db = get_db()
            db.execute('''
                INSERT INTO user (first_name, last_name, email, phone, location, interest_area, investment_level)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (first_name, last_name, email, phone, location, interest_area, investment_level))
            db.commit()
            
            flash('Registration successful! We will contact you with opportunities matching your profile.', 'success')
            return redirect(url_for('index'))
        
        except Exception as e:
            flash(f'Registration failed: {str(e)}', 'error')
            return redirect(url_for('register'))
    
    return render_template('register.html')

@app.route('/register-workshop', methods=['GET', 'POST'])
def register_workshop():
    if request.method == 'POST':
        try:
            first_name = request.form['first_name']
            last_name = request.form['last_name']
            email = request.form['email']
            phone = request.form['phone']
            workshop_type = request.form['workshop_type']
            payment_method = request.form['payment_method']
            
            db = get_db()
            db.execute('''
                INSERT INTO workshop_registration (first_name, last_name, email, phone, workshop_type, payment_method)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (first_name, last_name, email, phone, workshop_type, payment_method))
            db.commit()
            
            flash('Workshop registration successful! We will send you details shortly.', 'success')
            return redirect(url_for('education'))
        
        except Exception as e:
            flash(f'Registration failed: {str(e)}', 'error')
            return redirect(url_for('register_workshop'))
    
    return render_template('register_workshop.html')

@app.route('/admin')
def admin():
    """Admin dashboard - No authentication for now"""
    try:
        db = get_db()
        
        # Get all users
        users_cursor = db.execute('SELECT * FROM user ORDER BY registration_date DESC')
        users = users_cursor.fetchall()
        
        # Get all workshop registrations
        workshops_cursor = db.execute('SELECT * FROM workshop_registration ORDER BY registration_date DESC')
        workshop_registrations = workshops_cursor.fetchall()
        
        return render_template('admin.html', 
                             users=users, 
                             workshop_registrations=workshop_registrations)
    
    except Exception as e:
        flash(f'Error loading admin page: {str(e)}', 'error')
        return redirect(url_for('index'))

@app.route('/admin/delete/user/<int:user_id>', methods=['POST'])
def delete_user(user_id):
    """Delete a user (for admin only)"""
    try:
        db = get_db()
        db.execute('DELETE FROM user WHERE id = ?', (user_id,))
        db.commit()
        flash(f'User {user_id} deleted successfully', 'success')
    except Exception as e:
        flash(f'Error deleting user: {str(e)}', 'error')
    return redirect(url_for('admin'))

@app.route('/admin/delete/workshop/<int:workshop_id>', methods=['POST'])
def delete_workshop(workshop_id):
    """Delete a workshop registration (for admin only)"""
    try:
        db = get_db()
        db.execute('DELETE FROM workshop_registration WHERE id = ?', (workshop_id,))
        db.commit()
        flash(f'Workshop registration {workshop_id} deleted successfully', 'success')
    except Exception as e:
        flash(f'Error deleting workshop: {str(e)}', 'error')
    return redirect(url_for('admin'))

# Simple authentication (optional - uncomment if needed)
# ADMIN_USERNAME = 'admin'
# ADMIN_PASSWORD = 'cyntas2023'

# def check_auth(username, password):
#     return username == ADMIN_USERNAME and password == ADMIN_PASSWORD

# @app.route('/admin/login', methods=['GET', 'POST'])
# def admin_login():
#     if request.method == 'POST':
#         username = request.form.get('username')
#         password = request.form.get('password')
#         
#         if check_auth(username, password):
#             session['admin_logged_in'] = True
#             return redirect(url_for('admin'))
#         else:
#             flash('Invalid credentials', 'error')
#     
#     return render_template('login.html')

if __name__ == '__main__':
    # Create uploads directory if it doesn't exist
    if not os.path.exists('static/uploads'):
        os.makedirs('static/uploads')
    
    app.run(debug=True, port=5000)