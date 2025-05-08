import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Login from "./Receptionist/Authentication/Login";
import 'bootstrap/dist/css/bootstrap.min.css';


import Dashboard from "./Receptionist/Dashbord/Dashboard";
import HomePage from "./Home/HomePage"
import Patient_Reg from './Receptionist/Dashbord/Patient_Reg';
import Appointment from "./Receptionist/AppointmentBooking/Appointment";
import EditPatient from './Receptionist/Dashbord/Edit_Patient';
import ViewAllAppointment from  './Receptionist/AppointmentBooking/ViewAllAppointment';
import GenerateBill from './Receptionist/AppointmentBooking/GenerateBill';
import Patient_card from './Receptionist/Dashbord/Patient_card';
import ResceduleAppointment from './Receptionist/AppointmentBooking/ResceduleAppointment';
import ReschedulePayment from './Receptionist/AppointmentBooking/ReschedulePayment';



// Pharmacist
import PharmacistLogin from "./Pharmacist/Authentication/login";
import PharmacistDashboard from "./Pharmacist/components/Dashboard";
import AddMedicine from "./Pharmacist/components/Addmedicine";
import ListMedicines from "./Pharmacist/components/ListMedicine";
import UpdateMedicine from "./Pharmacist/components/UpdateMedicine";
import ManageMedicines from './Pharmacist/components/ManageMedicines';
import DeleteMedicine from "./Pharmacist/components/DeleteMedicine";
import PrescriptionView from "./Pharmacist/components/ViewPrescriptions";
import MedicineStockManagement from "./Pharmacist/components/ManageStock";
import MedicineBills from "./Pharmacist/components/MedicineBills";
import ViewDoctors from "./Receptionist/Dashbord/ViewDoctor";

import User from "./Home/Users";

import MedicineBill from "./Pharmacist/components/MedicineBill";



import DoctorLogin from "./Doctor/Authentication/Login";
import DoctorDashboard from "./Doctor/Dashbord/DoctorDashboard";
import PrescriptionPage from "./Doctor/Consultation/PrescribeMedicine";
import LabTestPrescription from "./Doctor/Consultation/LabTestPriscription";
import PatientHistory from "./Doctor/Consultation/PatientHistory";


import MedicinePrescription from "./Pharmacist/components/MedicinePriscription"

// Lab Technician
import LabtechnitionLogin from "./LabTechnician/Authentication/Login";
import LabDashboard from "./LabTechnician/Dashboard/LabDashboard";
import ManageLabTests from "./LabTechnician/Components/LabTestManagement";
import AddLabTest from "./LabTechnician/Components/AddLabTest";
import UpdateLabTest from "./LabTechnician/Components/UpdateLabTest"; // ✅ Add this
import DeleteLabTest from "./LabTechnician/Components/DeleteLabTest";
import LabTestPrescriptionView from './LabTechnician/Components/LabTestPrescription';
import AddLabReport from "./LabTechnician/Components/AddLabReport";
import UploadTestReports from "./LabTechnician/Components/UploadTestReport"; 

import AddDoctor from './Admin/Dashboard/AddDoctor';
import AddStaff from './Admin/Dashboard/AddStaff';
import AdminDashboard from './Admin/Dashboard/AdminDashboard';
import AdminLogin from "./Admin/Authentication/Login";

import FacultyLogin from './Home/FacultyLogin';

import SignUp from './Home/SignUp';


import LabBillForm from './LabTechnician/Components/LabBillForm';
import LabReportPrintView from './LabTechnician/Components/LabReportPrintView';
import ViewReceptionists from './Admin/ReceptionistCrud/ViewAllRecep';
import ViewAllDoctors from './Admin/Doctor/DoctorList';
import PharmacistList from './Admin/PharmacistCrud/Pharmacist';
function App()
{
  return(
    <Router>
      <Routes>
        {/* Admin */}
        <Route path="/pharmacists" element={<PharmacistList />} />
        <Route path="/signup-doctor" element={<SignUp/>} />
        <Route path="/faculty-login" element={<FacultyLogin />} />
        <Route path="/view-receptionists" element={<ViewReceptionists/>} />
        <Route path="/view-all-doctors" element={<ViewAllDoctors />} />


        <Route path="/add-doctor" element={<AddDoctor />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/add-staff" element={<AddStaff />} />


        <Route path="/labtechnition/lab-bill/:id" element={<LabBillForm />} />
        {/* Lab Technician Routes */}
        <Route path="/lab-login" element={<LabtechnitionLogin />} />
        <Route path="/labtechnition/dashboard" element={<LabDashboard />} />
        <Route path="/lab-test-management" element={<ManageLabTests />} />
        <Route path="/labtechnition/labtests/add" element={<AddLabTest />} />
        <Route path="/labtechnition/labtests/:id/update" element={<UpdateLabTest />} /> {/* ✅ FIXED */}
        <Route path="/labtechnition/labtests/:labTestId/delete" element={<DeleteLabTest />} /> 
        <Route path="/labtest-prescriptions" element={<LabTestPrescriptionView />} />
        <Route path="/labtechnition/add-result/:prescriptionId" element={<AddLabReport />} />

        <Route path="/labtechnition/upload-report" element={<UploadTestReports />} />

        <Route path="/labtechnition/labreports/:id/print" element={<LabReportPrintView/>}/>

        {/* Doctor */}
        
        
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/prescribe/:appointment_id" element={<PrescriptionPage />} />
        <Route path="/lab-test/:appointment_id" element={<LabTestPrescription />} />
        <Route path="/patient-history/:patient_id" element={<PatientHistory />} />



        {/* Receptionist */}
        {/* <Route path="/receptionist-login" element = {<Login/>}/> */}
        <Route path="/dashboard" element = {<Dashboard/>}/>
        <Route path="/" element = {<HomePage/>}/>
        <Route path="/patient_registration" element = {<Patient_Reg/>}/>
        <Route path="/edit-patient/:patientId" element={<EditPatient />} />
        <Route path="/appointment-booking" element={<Appointment/>} />
        <Route path="/billing/:appointmentId" element={<GenerateBill />} />
        <Route path="/appointments/list" element={<ViewAllAppointment />} />
        <Route path="/patient/:patientId" element={<Patient_card />} />
        <Route path="/appointments/reschedule/:appointmentId" element={<ResceduleAppointment />} />    
        <Route path="/appointments/reschedule-payment" element={<ReschedulePayment />} />    
        <Route path="/view-doctors" element={<ViewDoctors />} />    
        {/* *********************************************************************************** */}

        {/* Pharmacist */}
        {/* Pharmacist Routes */}
        <Route path="/view-prescription/:appointmentId" element={<MedicinePrescription />} />
        <Route path="/pharmacist-login" element={<PharmacistLogin />} />
        <Route path="/pharmacist/dashboard" element={<PharmacistDashboard />} />
        <Route path="/manage-medicines" element={<ManageMedicines />} />
        <Route path="/pharmacist/medicines" element={<ListMedicines />} />
        <Route path="/pharmacist/medicines/add" element={<AddMedicine />} />
        <Route path="/pharmacist/medicines/:id/update" element={<UpdateMedicine />} />
        <Route path="/pharmacist/medicines/:medicineId/delete" element={<DeleteMedicine />} />
        <Route path="/view-prescriptions" element={<PrescriptionView />} />
        <Route path="/manage-stock" element={<MedicineStockManagement />} />
        <Route path="/manage-bills" element={<MedicineBills />} />

        <Route path="/pharmacy/generate-bill" element={<MedicineBill />} />
      

        <Route path="/user" element={<User />} />
      </Routes>
    </Router>
  );

}
export default App;
