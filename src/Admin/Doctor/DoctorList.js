import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Avatar, Button, Space, Modal, message, Tag } from 'antd';
import { EditOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('https://blueeye10.pythonanywhere.com/api/get-doctors/');
      setDoctors(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch doctors');
      setLoading(false);
    }
  };

  const handleView = (record) => {
    setSelectedDoctor(record);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    message.info(`Edit doctor: ${record.doc_name}`);
  };

  const handleInactivate = (record) => {
    Modal.confirm({
      title: 'Confirm Inactivation',
      content: `Are you sure you want to inactivate Dr. ${record.doc_name}?`,
      onOk: async () => {
        try {
          // await axios.patch(`/api/doctors/${record.doc_id}/`, { is_active: false });
          message.success(`Dr. ${record.doc_name} inactivated successfully`);
          fetchDoctors();
        } catch (error) {
          message.error('Failed to inactivate doctor');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <Avatar 
          src={image ? image : '/default-avatar.png'} 
          size="small"
          style={{ borderRadius: '50%' }}
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'doc_name',
      key: 'doc_name',
    },
    // {
    //   title: 'Department',
    //   key: 'department',
    //   render: (_, record) => record.department.department_name,
    // },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (specialization) => <Tag color="blue">{specialization}</Tag>,
    },
    {
      title: 'Consultation',
      key: 'consultation',
      render: (_, record) => (
        <>
          <div>Time: {record.consultation_time}</div>
          <div>Fee: ${record.consultation_fee}</div>
        </>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Button 
            type="default" 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
            size="small"
          />
          <Button 
            danger 
            icon={<StopOutlined />} 
            onClick={() => handleInactivate(record)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Doctors List</h2>
      <Table 
        columns={columns} 
        dataSource={doctors} 
        rowKey="doc_id" 
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Doctor Details"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedDoctor && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <Avatar 
                src={selectedDoctor.image ? selectedDoctor.image : '/default-avatar.png'} 
                size={64}
                style={{ borderRadius: '50%', marginRight: '20px' }}
              />
              <div>
                <h3>Dr. {selectedDoctor.doc_name}</h3>
                <Tag color="blue">{selectedDoctor.specialization}</Tag>
              </div>
            </div>
            <p><strong>Department:</strong> {selectedDoctor.department.department_name}</p>
            <p><strong>Phone:</strong> {selectedDoctor.phone_number}</p>
            <p><strong>Email:</strong> {selectedDoctor.email}</p>
            <p><strong>Date of Birth:</strong> {selectedDoctor.dob}</p>
            <p><strong>Salary:</strong> ${selectedDoctor.salary}</p>
            <p><strong>Consultation Time:</strong> {selectedDoctor.consultation_time}</p>
            <p><strong>Consultation Fee:</strong> ${selectedDoctor.consultation_fee}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorList;