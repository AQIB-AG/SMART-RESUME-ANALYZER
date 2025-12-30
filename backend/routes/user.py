from flask import Blueprint, request, jsonify
from models.user import User
from models.database import db
from routes.auth import login_required, role_required

user_bp = Blueprint('user', __name__)


@user_bp.route('/', methods=['GET'])
@role_required(['admin'])
def get_all_users():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        role_filter = request.args.get('role')
        
        query = User.query
        
        if role_filter:
            query = query.filter_by(role=role_filter)
        
        users = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'users': [{
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_active': user.is_active,
                'created_at': user.created_at.isoformat() if user.created_at else None
            } for user in users.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': users.total,
                'pages': users.pages
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@user_bp.route('/<int:user_id>', methods=['GET'])
@role_required(['admin'])
def get_user(user_id):
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_active': user.is_active,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'updated_at': user.updated_at.isoformat() if user.updated_at else None
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@user_bp.route('/<int:user_id>', methods=['PUT'])
@role_required(['admin'])
def update_user(user_id):
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'role' in data:
            role = data['role']
            if role not in ['candidate', 'recruiter', 'admin']:
                return jsonify({'error': 'Invalid role. Must be candidate, recruiter, or admin'}), 400
            user.role = role
        
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_active': user.is_active
            }
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@user_bp.route('/<int:user_id>', methods=['DELETE'])
@role_required(['admin'])
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@user_bp.route('/search', methods=['GET'])
@role_required(['admin'])
def search_users():
    try:
        query_param = request.args.get('q', '')
        
        if not query_param:
            return jsonify({'error': 'Search query is required'}), 400
        
        users = User.query.filter(
            db.or_(
                User.email.contains(query_param),
                User.first_name.contains(query_param),
                User.last_name.contains(query_param)
            )
        ).all()
        
        return jsonify({
            'users': [{
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role
            } for user in users]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500