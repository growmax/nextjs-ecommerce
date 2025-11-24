export const mockOnPasswordChange = () => Promise.resolve(undefined);

export const defaultProps = {
  open: true,
  onOpenChange: () => {},
  onPasswordChange: mockOnPasswordChange,
  onSendOtp: undefined,
};
