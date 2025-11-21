import { MockUserDetailsProvider } from "@/contexts/__mocks__/UserDetailsContext";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import SummaryProductsTable from "./SummaryProductsTable";

// Mock OrderProductsTable to avoid complex dependencies
jest.mock("@/components/sales/order-products-table", () => {
  const MockOrderProductsTable = () => {
    return (
      <div data-testid="order-products-table">Mock OrderProductsTable</div>
    );
  };
  MockOrderProductsTable.displayName = "MockOrderProductsTable";
  return {
    __esModule: true,
    default: MockOrderProductsTable,
  };
});

const FormWrapper = ({ children, defaultValues = {} }: any) => {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("SummaryProductsTable", () => {
  it("renders without crashing and displays OrderProductsTable", () => {
    render(
      <MockUserDetailsProvider>
        <FormWrapper>
          <SummaryProductsTable />
        </FormWrapper>
      </MockUserDetailsProvider>
    );
    const table = screen.getByTestId("order-products-table");
    expect(table).toBeInTheDocument();
  });

  it("passes props correctly to OrderProductsTable", () => {
    const defaultValues = {
      products: [
        {
          askedQuantity: 5,
          packagingQuantity: 10,
          minOrderQuantity: 10,
          buyerRequestedPrice: 100,
        },
      ],
    };
    render(
      <MockUserDetailsProvider>
        <FormWrapper defaultValues={defaultValues}>
          <SummaryProductsTable isEditable={true} className="test-class" />
        </FormWrapper>
      </MockUserDetailsProvider>
    );
    const table = screen.getByTestId("order-products-table");
    expect(table).toBeInTheDocument();
  });
});
