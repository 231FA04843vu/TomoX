import React, { useState } from 'react';

function Step4Contract({ formData, setFormData, onSubmit, loading }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div>
      <div className="onboard-page-header">
        <div>
          <h1 className="onboard-page-title">Partner Contract</h1>
          <p className="card-subtitle" style={{ margin: 0, marginTop: '4px' }}>Review terms and sign digitally</p>
        </div>
      </div>

      <div className="onboard-form-card">
        <h2 className="card-title">Commercial Terms</h2>
        <p className="card-subtitle">Platform fees and commission details</p>

        <table className="swiggy-table">
          <tbody>
            <tr>
              <td>Platform Commission</td>
              <td style={{ fontWeight: 600 }}>18% + GST on every order</td>
            </tr>
            <tr>
              <td>Payment Gateway Fee</td>
              <td style={{ fontWeight: 600 }}>1.8% per transaction</td>
            </tr>
            <tr>
              <td>Onboarding Fee</td>
              <td style={{ fontWeight: 600 }}>₹943 (One-time)</td>
            </tr>
            <tr>
              <td>Settlement Cycle</td>
              <td style={{ fontWeight: 600 }}>Weekly (Every Wednesday)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="onboard-form-card">
        <h2 className="card-title">Letter of Understanding (LOU)</h2>
        <p className="card-subtitle">Please read the terms carefully</p>

        <div className="contract-preview">
          <div className="contract-header">MERCHANT TERMS AND CONDITIONS</div>
          1. The Merchant understands that TomoX is engaged in the business of inter-alia operating an online platform under the name and style "TomoX", through its Platform, which enables transactions between Merchants and Buyers, dealing in prepared food and beverages. The Platform is utilized by Buyer(s) to choose and place Order(s) from a variety of prepared food products listed and offered for sale by Merchants on the Platform.<br/><br/>
          2. The Merchant represents that (i) it is engaged in the business of food retail under the brand name serving food products and beverages through its multiple outlets owned and managed by the Merchant only and not the franchisees; (ii) it has full power and capacity to enter into and perform its obligations under this LOU; (iii) has taken all necessary licenses applicable to its business and is fully compliant with the provisions of the Food Safety and Standards Act, 2006 and rules and regulations prescribed thereunder ("FSSA"), as amended from time to time.<br/><br/>
          3. The Merchant understands and agrees that TomoX shall collect, for and on behalf of the Merchant, the payments received from the Buyers and remit the same to the bank account of the Merchant in accordance with the Payment Terms after deductions of Service Fee, Collection Fee and Other Charges.<br/><br/>
          4. The Merchant confirms and undertakes that it has read, understood and agrees to be bound by the terms set out in the Merchant Terms that are incorporated by reference herein and are deemed to be part of this LOU.<br/><br/>
          5. The effective date ("Effective Date") of this LOU shall be the date on which the Merchant signs this LOU (whether digitally or otherwise) and relay the same to TomoX. This LOU shall thereon have full force of a contract and shall bind both Merchant and TomoX fully upon on-boarding of Merchant on Platform for a period of 12 months.<br/><br/>
          [Digitally Signed by the Merchant]
        </div>

        <label className="contract-terms-box">
          <input 
            type="checkbox" 
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          I have read & accept all the terms and conditions
        </label>
      </div>

      <div className="onboard-action-bar" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
        <button 
          className={`btn-proceed ${accepted ? 'active' : ''}`} 
          disabled={!accepted || loading}
          onClick={onSubmit}
        >
          {loading ? 'Processing...' : 'Accept & Pay Onboarding Fee (₹943)'}
        </button>
      </div>
    </div>
  );
}

export default Step4Contract;
