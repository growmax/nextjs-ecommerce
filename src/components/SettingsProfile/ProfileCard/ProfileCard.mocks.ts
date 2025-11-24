export const sampleProfile = {
  name: "John Doe",
  email: "john@example.com",
  phone: "+911234567890",
  altPhone: "",
  altEmail: "john.alt@example.com",
  avatar: null,
};

export const defaultProps = {
  profile: sampleProfile,
  onChange: () => {},
  onImageChange: () => {},
  onVerifyPhone: () => {},
  phoneVerified: false,
  isLoading: false,
  dataLoading: false,
  countryCode: "+91",
  profileImage: null,
  originalPhone: null,
  originalAltPhone: null,
  headerActions: null,
};
