import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Toast, useToast } from '../components/Toast';
import '../styles/onboarding.css';

import Step1Info from '../components/onboarding/Step1Info';
import Step2Docs from '../components/onboarding/Step2Docs';
import Step3Menu from '../components/onboarding/Step3Menu';
import Step4Contract from '../components/onboarding/Step4Contract';

const API = import.meta.env.VITE_API;

function Onboarding() {
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();
  
  const [step, setStep] = useState(0); // 0 = Welcome screen, 1-4 = Form steps, 5 = Success screen
  const [loading, setLoading] = useState(false);

  const phone = localStorage.getItem('tempPhone') || '';
  
  const [formData, setFormData] = useState({
    // Step 1
    ownerFullName: '',
    restaurantName: '',
    restaurantAddress: '',
    contactEmail: '',
    whatsappNumber: '',
    workingDays: [],
    timings: { sameAllDays: true, timeSlots: [] },
    // Step 2
    outletType: '',
    panNumber: '',
    panImage: null,
    gstin: '',
    bankIfsc: '',
    bankAccount: '',
    fssaiNumber: '',
    // Step 3
    hasPos: false,
    foodType: '',
    cuisines: [],
    costForTwo: '',
    menuFile: null,
    packagingChargeType: ''
  });

  const handleNext = () => {
    window.scrollTo(0, 0);
    setStep(s => s + 1);
  };

  const handleBack = () => {
    window.scrollTo(0, 0);
    setStep(s => s - 1);
  };

  const handleSaveAndProceed = () => {
    // Validate current step before proceeding
    if (step === 1) {
      if (!formData.ownerFullName || !formData.restaurantName || !formData.restaurantAddress || !formData.contactEmail) {
        showToast('Please fill all required basic details', 'error');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        showToast('Please enter a valid email address', 'error');
        return;
      }
      if (formData.whatsappNumber && !/^[0-9]{10}$/.test(formData.whatsappNumber)) {
        showToast('WhatsApp number must be exactly 10 digits', 'error');
        return;
      }
    }
    if (step === 2) {
      if (!formData.panNumber || !formData.bankIfsc || !formData.bankAccount || !formData.fssaiNumber || !formData.panImage) {
        showToast('Please fill all required documents and upload PAN', 'error');
        return;
      }
      if (!/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/.test(formData.panNumber)) {
        showToast('Invalid PAN Number format (e.g. ABCDE1234F)', 'error');
        return;
      }
      if (formData.gstin && !/^[A-Za-z0-9]{15}$/.test(formData.gstin)) {
        showToast('GSTIN must be exactly 15 alphanumeric characters', 'error');
        return;
      }
      if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(formData.bankIfsc)) {
        showToast('Invalid Bank IFSC Code format', 'error');
        return;
      }
      if (!/^[0-9]{9,18}$/.test(formData.bankAccount)) {
        showToast('Bank Account Number must be between 9 and 18 digits', 'error');
        return;
      }
      if (!/^[0-9]{14}$/.test(formData.fssaiNumber)) {
        showToast('FSSAI Number must be exactly 14 digits', 'error');
        return;
      }
    }
    if (step === 3 && (!formData.costForTwo || !formData.menuFile)) {
      showToast('Please provide cost for two and upload menu', 'error');
      return;
    }
    handleNext();
  };

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);
      const payload = new FormData();
      
      // Basic auth fields for the backend
      payload.append('name', formData.restaurantName || formData.ownerFullName);
      payload.append('phone', phone);
      payload.append('email', formData.contactEmail);
      payload.append('password', '123456'); // default for now
      
      // Step 1
      payload.append('ownerFullName', formData.ownerFullName);
      payload.append('restaurantName', formData.restaurantName);
      payload.append('restaurantAddress', formData.restaurantAddress);
      payload.append('contactEmail', formData.contactEmail);
      payload.append('whatsappNumber', formData.whatsappNumber);
      payload.append('workingDays', JSON.stringify(formData.workingDays));
      payload.append('timings', JSON.stringify(formData.timings));
      
      // Step 2
      payload.append('outletType', formData.outletType);
      payload.append('panNumber', formData.panNumber);
      payload.append('gstin', formData.gstin);
      payload.append('bankIfsc', formData.bankIfsc);
      payload.append('bankAccount', formData.bankAccount);
      payload.append('fssaiNumber', formData.fssaiNumber);
      if (formData.panImage) payload.append('panImage', formData.panImage);
      
      // Step 3
      payload.append('hasPos', formData.hasPos);
      payload.append('foodType', formData.foodType);
      payload.append('cuisines', JSON.stringify(formData.cuisines));
      payload.append('costForTwo', formData.costForTwo);
      payload.append('packagingChargeType', formData.packagingChargeType);
      if (formData.menuFile) payload.append('menuFile', formData.menuFile);

      // Dummy proof for legacy backend compatibility
      const dummyFile = new File(['dummy proof'], 'proof.pdf', { type: 'application/pdf' });
      payload.append('proof', dummyFile);

      // Simulate Payment Gateway Delay
      showToast('Redirecting to payment gateway...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const res = await axios.post(`${API}/api/vendors/register`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 201 || res.status === 200) {
        showToast('Payment successful & Application submitted!', 'success');
        setStep(5); // Success Screen
      }
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Error submitting application', 'error');
    } finally {
      setLoading(false);
    }
  };

  const stepsData = [
    { num: 1, name: 'Restaurant Information', desc: 'Name, address and contact details' },
    { num: 2, name: 'Restaurant Documents', desc: 'PAN, GSTIN, FSSAI and Bank Details' },
    { num: 3, name: 'Menu Setup', desc: 'Food details, Cuisines, and POS' },
    { num: 4, name: 'Partner Contract', desc: 'Review terms and sign digitally' },
  ];

  return (
    <div className="onboard-page">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <header className="onboard-header">
        <div className="onboard-logo">
          <i className="fas fa-location-dot"></i> TomoX for restaurants
        </div>
        <Link to="#" className="onboard-faqs">FAQs</Link>
      </header>

      <main className="onboard-main-layout">
        {/* Welcome Screen */}
        {step === 0 && (
          <div style={{ flex: 1, maxWidth: '600px', margin: '40px auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#1f2937', marginBottom: '16px' }}>Make your restaurant delivery-ready in 24hrs!</h1>
            <div style={{ width: '60px', height: '4px', backgroundColor: '#fc8019', marginBottom: '24px' }}></div>
            <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '40px' }}>Fast track your growth with TomoX Accelerator + benefits upto ₹40,000</p>
            
            <div className="onboard-form-card">
              <p style={{ fontWeight: '700', fontSize: '16px', marginBottom: '24px' }}>For an easy form filling process, you can keep the following handy.</p>
              <ul className="upload-requirements" style={{ paddingLeft: 0 }}>
                <li><i className="fas fa-circle" style={{ color: '#fc8019', fontSize: '8px', marginRight: '8px', verticalAlign: 'middle' }}></i> PAN Number</li>
                <li><i className="fas fa-circle" style={{ color: '#fc8019', fontSize: '8px', marginRight: '8px', verticalAlign: 'middle' }}></i> GSTIN Number (Optional)</li>
                <li><i className="fas fa-circle" style={{ color: '#fc8019', fontSize: '8px', marginRight: '8px', verticalAlign: 'middle' }}></i> Bank Details (IFSC & Account)</li>
                <li><i className="fas fa-circle" style={{ color: '#fc8019', fontSize: '8px', marginRight: '8px', verticalAlign: 'middle' }}></i> FSSAI Registration Number</li>
                <li><i className="fas fa-circle" style={{ color: '#fc8019', fontSize: '8px', marginRight: '8px', verticalAlign: 'middle' }}></i> Menu PDF or Image</li>
              </ul>
              <button className="btn-proceed active" style={{ marginTop: '24px' }} onClick={handleNext}>Let's Begin!</button>
            </div>
          </div>
        )}

        {/* Steps 1-4 */}
        {step >= 1 && step <= 4 && (
          <>
            <div className="onboard-sidebar">
              <div className="sidebar-back" onClick={() => step === 1 ? setStep(0) : handleBack()}>
                <i className="fas fa-arrow-left"></i> Back
              </div>
              
              <div className="onboard-steps">
                {stepsData.map((s, index) => {
                  const isActive = step === s.num;
                  const isCompleted = step > s.num;
                  
                  return (
                    <div key={s.num} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                      <div className="step-indicator"></div>
                      <div className="step-title">STEP {s.num}</div>
                      <div className="step-name">{s.name}</div>
                      {isActive && <div className="step-desc">{s.desc}</div>}
                      {isCompleted && (
                        <div className="step-edit" onClick={() => setStep(s.num)}>EDIT</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="onboard-content-area">
              {step === 1 && <Step1Info formData={formData} setFormData={setFormData} onNext={handleNext} />}
              {step === 2 && <Step2Docs formData={formData} setFormData={setFormData} onNext={handleNext} />}
              {step === 3 && <Step3Menu formData={formData} setFormData={setFormData} onNext={handleNext} />}
              {step === 4 && <Step4Contract formData={formData} setFormData={setFormData} onSubmit={handleFinalSubmit} loading={loading} />}

              {/* Next Button for Steps 1-3 */}
              {step < 4 && (
                <div className="onboard-action-bar">
                  <button className="btn-proceed active" onClick={handleSaveAndProceed}>Save & Next</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Success Screen */}
        {step === 5 && (
          <div style={{ flex: 1, maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
            <div style={{ background: '#10b981', padding: '40px', borderRadius: '12px 12px 0 0', color: 'white' }}>
              <i className="fas fa-store" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
              <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Thanks for the details!</h1>
            </div>
            <div style={{ background: 'white', padding: '40px', borderRadius: '0 0 12px 12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', marginBottom: '24px' }}>We're working to take your restaurant live soon!</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'left', marginBottom: '40px' }}>
                <div style={{ color: '#10b981', fontWeight: 500 }}><i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i> Bank details</div>
                <div style={{ color: '#fc8019', fontWeight: 500 }}><i className="fas fa-clock" style={{ marginRight: '8px' }}></i> Lead details being verified</div>
                <div style={{ color: '#10b981', fontWeight: 500 }}><i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i> PAN & GSTIN</div>
                <div style={{ color: '#fc8019', fontWeight: 500 }}><i className="fas fa-clock" style={{ marginRight: '8px' }}></i> Menu digitisation in progress</div>
                <div style={{ color: '#10b981', fontWeight: 500 }}><i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i> FSSAI</div>
              </div>

              <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px', fontSize: '13px', color: '#4b5563', marginBottom: '24px' }}>
                <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
                Please verify your email. Look for a mail from TomoX Technologies Pvt Ltd.
              </div>

              <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '32px 0' }} />

              <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600, letterSpacing: '1px', marginBottom: '8px' }}>- ONE LAST STEP -</div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', marginBottom: '24px' }}>Complete your training now!</h2>

              <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ flex: 1, padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>Learn how to get the best out of your TomoX app.</h3>
                  <button className="btn-proceed active" style={{ padding: '8px 16px', width: 'auto', alignSelf: 'flex-start' }} onClick={() => navigate('/login')}>
                    <i className="fas fa-play" style={{ marginRight: '8px' }}></i> Watch Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Onboarding;
