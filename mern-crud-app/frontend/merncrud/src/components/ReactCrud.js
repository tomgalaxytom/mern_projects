import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Input, Form, notification, Select, Radio, Checkbox,Upload } from 'antd';
import axios from 'axios';
const { confirm } = Modal;
const { Option } = Select;
const ReactCrud = () => {
  const [personalInfo, setPersonalInfo] = useState([]); // State to store personal info data
  const [currentUser, setCurrentUser] = useState({}); // For user info
  const [editMode, setEditMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [fileList, setFileList] = useState([]); // For file uploads
  // Fetch data from backend
  useEffect(() => {
    const fetchPersonalInfo = async () => {
      try {
        const response = await axios.get('http://localhost:5000/personal_info');
        setPersonalInfo(response.data); // Assuming the data is returned in `response.data`
      } catch (error) {
        console.error('Error fetching personal info:', error);
      }
    };
    fetchPersonalInfo();
  }, []);
  // Add user
  const addPersonalInfo = async (newInfo) => {
    // Append files from fileList to formData
    const formData = new FormData();

  // Append the text fields
  formData.append('name', newInfo.name);
  formData.append('email', newInfo.email);
  formData.append('mobile_number', newInfo.mobile_number);
  formData.append('city', newInfo.city);
  formData.append('state', newInfo.state);
  formData.append('gender', newInfo.gender);
  formData.append('hobbie', JSON.stringify(newInfo.hobbie));
  formData.append('address', newInfo.address);
  formData.append('pincode', newInfo.pincode);

  // Append the file
  if (fileList.length > 0) {
    formData.append('file', fileList[0].originFileObj); // Append the actual file
  }
    try {
      const response = await axios.post('http://localhost:5000/personal_info/add', formData, {
        headers: {
          'Content-Type': 'application/form-data',
        },
      });
      setPersonalInfo([...personalInfo, response.data]); // Add the new record to the state
      notification.success({ message: 'Success', description: 'Record added successfully.' });
      handleCancel(); // Close modal after submission
    } catch (error) {
      console.error('Error adding personal info:', error);
      notification.error({ message: 'Error', description: 'Failed to add record.' });
    }
  };
  // Edit user
  const editPersonalInfo = async (updatedInfo) => {
    try {
        const formData = new FormData();

        // Append each field from updatedInfo to the formData
        Object.keys(updatedInfo).forEach(key => {
            if (key === "hobbie") {
                // Convert hobbies array to a JSON string
                formData.append('hobbie', JSON.stringify(updatedInfo.hobbie));
            } else if (key === "file") {
                // If a new file is uploaded, use it
                if (fileList.length > 0) {
                    formData.append('file', fileList[0].originFileObj); // Append the new file
                }
            } else {
                formData.append(key, updatedInfo[key]); // Append all other fields
            }
        });

        const response = await axios.put(`http://localhost:5000/personal_info/edit/${updatedInfo._id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Important for file uploads
            },
        });

        setPersonalInfo(personalInfo.map(info => info._id === updatedInfo._id ? response.data : info));
        notification.success({ message: 'Success', description: 'Record updated successfully.' });
        handleCancel();
    } catch (error) {
        console.error('Error updating personal info:', error);
        notification.error({ message: 'Error', description: 'Failed to update record.' });
    }
};


  // Delete user
  const deletePersonalInfo = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/personal_info/delete/${id}`);
      setPersonalInfo(personalInfo.filter(info => info._id !== id)); // Remove deleted record from state
      notification.success({ message: 'Success', description: 'Record deleted successfully.' });
    } catch (error) {
      console.error('Error deleting personal info:', error);
      notification.error({ message: 'Error', description: 'Failed to delete record.' });
    }
  };
  // Modal functions
  const showModal = () => {
    setCurrentUser({}); // Reset the form
    setIsModalVisible(true);
    setEditMode(false); // Ensure edit mode is false when adding a new user
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentUser({});
    setFileList([]); // Reset file list
  };
  const showDeleteConfirm = (id) => {
    confirm({
      title: 'Are you sure you want to delete this user?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deletePersonalInfo(id); // Call the delete function
      },
    });
  };
  const handleEditTask = (id, user) => {
    // Ensure hobbie is either a string or an empty array if it's undefined
    const hobbiesArray = Array.isArray(user.hobbie)
        ? user.hobbie
        : typeof user.hobbie === 'string'
            ? user.hobbie.split(', ').map(hobby => hobby.trim())
            : []; // fallback to an empty array if hobbie is not defined

    setCurrentUser({ ...user, hobbie: hobbiesArray });
    setEditMode(true);
    setIsModalVisible(true);
};


  // Search filter for tasks
  const filteredTasks = personalInfo.filter((task) => {
    const query = searchQuery.toLowerCase();
    return (
      (task.name && task.name.toLowerCase().includes(query)) ||
      (task.email && task.email.toLowerCase().includes(query)) ||
      (task.city && task.city.toLowerCase().includes(query))
    );
  });
  // Table columns
  const columns = [
    {
      title: 'Serial No.',
      key: 'serial',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Attachment',
      dataIndex: 'file',
      key: 'file',
      render: (file) => (
          <img
              src={`http://localhost:5000/uploads/${file}`} // Adjust this path based on your setup
              alt="Uploaded File"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }} // Set the size and object fit
          />
      ),
  },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <Button size="middle" onClick={() => handleEditTask(record._id, record)}>
            Edit
          </Button>
          <Button size="middle" type="danger" onClick={() => showDeleteConfirm(record._id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];
  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">MERN FULL STACK</h1>
      {/* Search Input */}
      <div className="text-center mb-4">
        <Input
          placeholder="Search tasks by Name, Email, or City..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 300 }}
        />
      </div>
      {/* Add User Button */}
      <div className="text-center mb-4">
        <Button type="primary" onClick={showModal}>
          Add User
        </Button>
      </div>
      {/* User List with Pagination */}
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <Table
           dataSource={filteredTasks.map((task) => ({ ...task, key: task._id }))}
            columns={columns}
            pagination={{
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '15', personalInfo.length.toString()],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              onShowSizeChange: (current, size) => {
                setPageSize(size === personalInfo.length.toString() ? personalInfo.length : parseInt(size));
              },
            }}
          />
        </div>
      </div>
      {/* Modal for Add/Edit User */}
      <Modal
        title={editMode ? "Edit User" : "Add User"}
        open={isModalVisible} // Change 'open' to 'visible'
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={editMode ? () => editPersonalInfo(currentUser) : () => addPersonalInfo(currentUser)}>
            {editMode ? "Save" : "Submit"}
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Username" required>
            <Input
              value={currentUser.name}
              onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
              placeholder="Enter username"
            />
          </Form.Item>
          <Form.Item label="Email" required>
            <Input
              value={currentUser.email}
              onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
              placeholder="Enter email"
            />
          </Form.Item>
          <Form.Item label="Mobile Number" required>
            <Input
              value={currentUser.mobile_number}
              onChange={(e) => setCurrentUser({ ...currentUser, mobile_number: e.target.value })}
              placeholder="Enter mobile number"
              maxLength={10}
            />
          </Form.Item>
          <Form.Item label="City" required>
            <Input
              value={currentUser.city}
              onChange={(e) => setCurrentUser({ ...currentUser, city: e.target.value })}
              placeholder="Enter city"
            />
          </Form.Item>
          <Form.Item label="State" required>
            <Select
              value={currentUser.state}
              onChange={(value) => setCurrentUser({ ...currentUser, state: value })}
              placeholder="Select state"
            >
              <Option value="Tamil Nadu">Tamil Nadu</Option>
              <Option value="Andhra Pradesh">Andhra Pradesh</Option>
              <Option value="Kerala">Kerala</Option>
              <Option value="Karnataka">Karnataka</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Gender" required>
            <Radio.Group
              value={currentUser.gender}
              onChange={(e) => setCurrentUser({ ...currentUser, gender: e.target.value })}
            >
              <Radio value="Male">Male</Radio>
              <Radio value="Female">Female</Radio>
            </Radio.Group>
          </Form.Item>
       <Form.Item label="Hobbies" required>
  <Checkbox.Group
    options={['Cricket', 'Football', 'Hockey', 'Basketball']}
    value={currentUser.hobbie || []} // Keep 'hobbie' as an array
    onChange={(checkedValues) => setCurrentUser({ ...currentUser, hobbie: checkedValues })} // Keep the array structure
  />
</Form.Item>
          <Form.Item label="Address" required>
            <Input.TextArea
              value={currentUser.address}
              onChange={(e) => setCurrentUser({ ...currentUser, address: e.target.value })}
              placeholder="Enter address"
              rows={4}
            />
          </Form.Item>
          <Form.Item label="Pincode" required>
            <Input
              value={currentUser.pincode}
              onChange={(e) => setCurrentUser({ ...currentUser, pincode: e.target.value })}
              placeholder="Enter pincode"
              maxLength={6} // Set max length for pincode
            />
          </Form.Item>
          {/* <Form.Item label="File Upload">
  <Upload
    multiple={false}
    fileList={fileList}
    onChange={({ fileList: newFileList }) => setFileList(newFileList)} // Update file list state
    beforeUpload={() => false} // Prevent automatic upload; let form handle it
  >
    <Button>Upload File</Button>
  </Upload>
</Form.Item> */}
<Form.Item label="File Upload">
  <Upload
    multiple={false}
    fileList={fileList}
    onChange={({ fileList: newFileList }) => setFileList(newFileList)} // Update file list state
    beforeUpload={() => false} // Prevent automatic upload; let form handle it
  >
    <Button>Upload File</Button>
  </Upload>
</Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default ReactCrud;
