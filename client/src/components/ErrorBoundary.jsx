import React from 'react';
import { connect } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { performLogout } from '@/utils/logoutUtil';

class ErrorBoundary extends React.Component {
    
  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    if (error.message.includes('expired') || error.response?.status === 401) {
      this.props.logout();

    }
  }

  render() {
    return this.props.children;
  }
}

export default connect(null, { logout })(ErrorBoundary);