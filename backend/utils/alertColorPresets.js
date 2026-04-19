const ALERT_COLOR_PRESETS = {
  info: {
    backgroundColor: '#E6F1FB',
    borderColor: '#B5D4F4',
    accentColor: '#185FA5',
    titleColor: '#0C447C',
    bodyColor: '#185FA5',
  },
  warning: {
    backgroundColor: '#FAEEDA',
    borderColor: '#FAC775',
    accentColor: '#BA7517',
    titleColor: '#633806',
    bodyColor: '#854F0B',
  },
  error: {
    backgroundColor: '#FCEBEB',
    borderColor: '#F7C1C1',
    accentColor: '#A32D2D',
    titleColor: '#501313',
    bodyColor: '#791F1F',
  },
  success: {
    backgroundColor: '#EAF3DE',
    borderColor: '#C0DD97',
    accentColor: '#639922',
    titleColor: '#27500A',
    bodyColor: '#3B6D11',
  },
  alert: {
    backgroundColor: '#FAECE7',
    borderColor: '#F5C4B3',
    accentColor: '#D85A30',
    titleColor: '#4A1B0C',
    bodyColor: '#712B13',
  },
  announcement: {
    backgroundColor: '#EEEDFE',
    borderColor: '#CECBF6',
    accentColor: '#7F77DD',
    titleColor: '#26215C',
    bodyColor: '#534AB7',
  },
  critical: {
    backgroundColor: '#501313',
    borderColor: '#791F1F',
    accentColor: '#E24B4A',
    titleColor: '#F7C1C1',
    bodyColor: '#F09595',
  },
  neutral: {
    backgroundColor: '#F1EFE8',
    borderColor: '#D3D1C7',
    accentColor: '#888780',
    titleColor: '#2C2C2A',
    bodyColor: '#5F5E5A',
  },
};

function getAlertColorPreset(icon) {
  if (icon && ALERT_COLOR_PRESETS[icon]) {
    return ALERT_COLOR_PRESETS[icon];
  }
  return ALERT_COLOR_PRESETS.info;
}

module.exports = {
  ALERT_COLOR_PRESETS,
  getAlertColorPreset,
};
