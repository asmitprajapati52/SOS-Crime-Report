import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { reportAPI } from '../utils/api';

const ValidateButton = ({ reportId, currentValidations = 0, onValidated }) => {
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleValidate = async () => {
    if (validated) {
      toast.info('You already validated this report');
      return;
    }

    setLoading(true);
    try {
      const res = await reportAPI.validate(reportId);
      toast.success(`✅ Report validated! (${res.data.data.validationCount}/5)`);
      setValidated(true);
      if (onValidated) onValidated();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleValidate}
      className={validated ? "btn-outline" : "btn-neon"}
      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
      disabled={loading || validated}
    >
      {validated ? '✓ Validated' : `👍 Validate (${currentValidations}/5)`}
    </button>
  );
};

export default ValidateButton;
