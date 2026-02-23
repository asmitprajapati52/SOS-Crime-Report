import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../utils/api';

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', relation: 'Mother' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const res = await authAPI.getEmergencyContacts();
      setContacts(res.data.data);
    } catch (error) {
      console.error('Load contacts error:', error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await authAPI.addEmergencyContact(formData);
      toast.success(`✅ ${formData.name} added as emergency contact`);
      setFormData({ name: '', phone: '', relation: 'Mother' });
      setShowAdd(false);
      loadContacts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this emergency contact?')) return;
    
    try {
      await authAPI.deleteEmergencyContact(id);
      toast.success('Contact removed');
      loadContacts();
    } catch (error) {
      toast.error('Failed to remove contact');
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📞 Emergency Contacts ({contacts.length}/5)</h3>
        {contacts.length < 5 && (
          <button onClick={() => setShowAdd(!showAdd)} className="btn-outline" style={{ padding: '0.5rem 1rem' }}>
            {showAdd ? 'Cancel' : '+ Add Contact'}
          </button>
        )}
      </div>

      {showAdd && contacts.length < 5 && (
        <form onSubmit={handleAdd} className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', borderRadius: '1rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>Add New Contact</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              className="input-field"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
            />
            <input
              className="input-field"
              placeholder="Phone (+91 98765 43210)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={loading}
            />
            <select
              className="input-field"
              value={formData.relation}
              onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
              disabled={loading}
            >
              <option value="Mother">Mother</option>
              <option value="Father">Father</option>
              <option value="Spouse">Spouse</option>
              <option value="Sibling">Sibling</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
            <button type="submit" className="btn-neon" disabled={loading}>
              {loading ? 'Adding...' : 'Add Contact'}
            </button>
          </div>
        </form>
      )}

      <div>
        {contacts.length === 0 ? (
          <p style={{ textAlign: 'center', opacity: 0.6, padding: '2rem' }}>
            No emergency contacts added yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {contacts.map((contact) => (
              <div key={contact._id} className="glass" style={{ padding: '1rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{contact.name}</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                    {contact.relation} • {contact.phone}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(contact._id)}
                  style={{ background: '#ef4444', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {contacts.length > 0 && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(43,165,255,0.1)', borderRadius: '0.75rem' }}>
          <p style={{ fontSize: '0.875rem' }}>
            ℹ️ These contacts will be automatically notified when you trigger an SOS alert.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmergencyContacts;
