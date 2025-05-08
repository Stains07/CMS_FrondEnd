import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Avatar, Button, Space, Modal, message } from 'antd';
import { EditOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons';

const ReceptionistList = () => {
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReceptionist, setSelectedReceptionist] = useState(null);

  useEffect(() => {
    fetchReceptionists();
  }, []);

  const fetchReceptionists = async () => {
    try {
      const response = await axios.get('https://blueeye10.pythonanywhere.com/api/get-receptionists/');
      setReceptionists(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch receptionists');
      setLoading(false);
    }
  };

  const handleView = (record) => {
    setSelectedReceptionist(record);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    message.info(`Edit receptionist: ${record.first_name} ${record.last_name}`);
  };

  const handleInactivate = (record) => {
    Modal.confirm({
      title: 'Confirm Inactivation',
      content: `Are you sure you want to inactivate ${record.first_name} ${record.last_name}?`,
      onOk: async () => {
        try {
          // await axios.patch(`/api/receptionists/${record.rec_id}/`, { is_active: false });
          message.success(`${record.first_name} ${record.last_name} inactivated successfully`);
          fetchReceptionists();
        } catch (error) {
          message.error('Failed to inactivate receptionist');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image, record) => (
        <Avatar
          src={
            image
              ? `https://blueeye10.pythonanywhere.com${image}`
              : `https://ui-avatars.com/api/?background=4ECDC4&color=fff&name=${encodeURIComponent(
                  record.first_name || 'R'
                )}`
          }
          size="small"
          style={{ borderRadius: '50%', border: '2px solid #038c83' }}
          onError={() => {
            return true; // Prevents infinite loop if fallback fails
          }}
        />
      ),
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: 'Phone',
      dataIndex: 'phone_number',
      key: 'phone_number',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Qualification',
      dataIndex: 'qualification',
      key: 'qualification',
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary) => `$${salary}`,
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
      <h2>Receptionist List</h2>
      <Table
        columns={columns}
        dataSource={receptionists}
        rowKey="rec_id"
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Receptionist Details"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedReceptionist && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <Avatar
                src={
                  selectedReceptionist.image
                    ? `http://localhost:8000${selectedReceptionist.image}`
                    : `https://ui-avatars.com/api/?background=4ECDC4&color=fff&name=${encodeURIComponent(
                        selectedReceptionist.first_name || 'R'
                      )}`
                }
                size={64}
                style={{ borderRadius: '50%', border: '3px solid #038c83', marginRight: '20px' }}
                onError={() => {
                  return true;
                }}
              />
              <h3>
                {selectedReceptionist.first_name} {selectedReceptionist.last_name}
              </h3>
            </div>
            <p>
              <strong>Phone:</strong> {selectedReceptionist.phone_number}
            </p>
            <p>
              <strong>Email:</strong> {selectedReceptionist.email}
            </p>
            <p>
              <strong>Date of Birth:</strong> {selectedReceptionist.dob}
            </p>
            <p>
              <strong>Qualification:</strong> {selectedReceptionist.qualification}
            </p>
            <p>
              <strong>Salary:</strong> ${selectedReceptionist.salary}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReceptionistList;