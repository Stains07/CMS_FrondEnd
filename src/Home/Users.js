import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaUserTie, FaUserMd, FaPills, FaFlask, FaUserInjured } from 'react-icons/fa';
import { motion } from 'framer-motion';

const RoleDashboard = () => {
  const navigate = useNavigate();

  const roles = [
    {
      name: 'Admin',
      icon: <FaUserShield size={24} />,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      route: '/admin-login'
    },
    {
      name: 'Receptionist',
      icon: <FaUserTie size={24} />,
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      route: '/receptionist-login'
    },
    {
      name: 'Doctor',
      icon: <FaUserMd size={24} />,
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      route: '/doctor/login'
    },
    {
      name: 'Pharmacist',
      icon: <FaPills size={24} />,
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      route: '/pharmacist-login'
    },
    {
      name: 'Lab Technician',
      icon: <FaFlask size={24} />,
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
      route: '/lab-login'
    },
    {
      name: 'Patient',
      icon: <FaUserInjured size={24} />,
      color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      route: '/faculty-login'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">Choose Your Portal</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {roles.map((role, index) => (
          <motion.div
            key={index}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-xl shadow-md overflow-hidden cursor-pointer"
            onClick={() => navigate(role.route)}
          >
            <div
              className="flex items-center justify-center h-24 text-white"
              style={{ background: role.color }}
            >
              <div className="text-center">
                <div className="mb-1">{role.icon}</div>
                <div className="text-sm font-bold">{role.name}</div>
              </div>
            </div>
            <div className="bg-white text-xs text-gray-600 text-center py-2">
              Click to access {role.name}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RoleDashboard;
