import { describe, expect, it } from "@jest/globals";
import { BuyerQuoteSummaryValidations } from "./validation";

describe("BuyerQuoteSummaryValidations", () => {
  describe("customerRequiredDate Validation", () => {
    it("should require date when isCustomerDateRequired is true", async () => {
      // Arrange
      const data = {
        isCustomerDateRequired: true,
        customerRequiredDate: undefined,
      };

      // Act & Assert
      await expect(
        BuyerQuoteSummaryValidations.validate(data)
      ).rejects.toThrow("Provide required delivery date");
    });

    it("should accept valid date when isCustomerDateRequired is true", async () => {
      // Arrange
      const data = {
        isCustomerDateRequired: true,
        customerRequiredDate: new Date("2025-12-31"),
      };

      // Act
      const result = await BuyerQuoteSummaryValidations.validate(data);

      // Assert
      expect(result.customerRequiredDate).toEqual(new Date("2025-12-31"));
    });

    it("should not require date when isCustomerDateRequired is false", async () => {
      // Arrange
      const data = {
        isCustomerDateRequired: false,
        customerRequiredDate: null,
      };

      // Act
      const result = await BuyerQuoteSummaryValidations.validate(data);

      // Assert
      expect(result.customerRequiredDate).toBeNull();
    });

    it("should reject invalid date format", async () => {
      // Arrange
      const data = {
        isCustomerDateRequired: true,
        customerRequiredDate: "invalid-date",
      };

      // Act & Assert
      await expect(
        BuyerQuoteSummaryValidations.validate(data)
      ).rejects.toThrow();
    });
  });

  describe("buyerReferenceNumber Validation", () => {
    it("should accept valid reference number", async () => {
      // Arrange
      const data = {
        buyerReferenceNumber: "REF-12345",
      };

      // Act
      const result = await BuyerQuoteSummaryValidations.validate(data);

      // Assert
      expect(result.buyerReferenceNumber).toBe("REF-12345");
    });

    it("should accept null reference number", async () => {
      // Arrange
      const data = {
        buyerReferenceNumber: null,
      };

      // Act
      const result = await BuyerQuoteSummaryValidations.validate(data);

      // Assert
      expect(result.buyerReferenceNumber).toBeNull();
    });

    it("should reject reference number exceeding 35 characters", async () => {
      // Arrange
      const data = {
        buyerReferenceNumber: "A".repeat(36),
      };

      // Act & Assert
      await expect(
        BuyerQuoteSummaryValidations.validate(data)
      ).rejects.toThrow("Invalid content");
    });

    it("should reject reference number with XSS content", async () => {
      // Arrange
      const data = {
        buyerReferenceNumber: "<script>alert('XSS')</script>",
      };

      // Act & Assert
      await expect(
        BuyerQuoteSummaryValidations.validate(data)
      ).rejects.toThrow("Invalid content");
    });

    it("should accept reference number at max length (35 chars)", async () => {
      // Arrange
      const data = {
        buyerReferenceNumber: "A".repeat(35),
      };

      // Act
      const result = await BuyerQuoteSummaryValidations.validate(data);

      // Assert
      expect(result.buyerReferenceNumber).toBe("A".repeat(35));
    });
  });

  describe("comment Validation", () => {
    it("should accept valid comment", async () => {
      // Arrange
      const data = {
        comment: "This is a valid comment",
      };

      // Act
      const result = await BuyerQuoteSummaryValidations.validate(data);

      // Assert
      expect(result.comment).toBe("This is a valid comment");
    });

    it("should accept null comment", async () => {
      // Arrange
      const data = {
        comment: null,
      };

      // Act
      const result = await BuyerQuoteSummaryValidations.validate(data);

      // Assert
      expect(result.comment).toBeNull();
    });

    it("should reject comment exceeding 2000 characters", async () => {
      // Arrange
      const data = {
        comment: "A".repeat(2001),
      };

      // Act & Assert
      await expect(
        BuyerQuoteSummaryValidations.validate(data)
      ).rejects.toThrow("Invalid content");
    });

    it("should reject comment with XSS content", async () => {
      // Arrange
      const data = {
        comment: "Normal text <script>alert('XSS')</script> more text",
      };

      // Act & Assert
      await expect(
        BuyerQuoteSummaryValidations.validate(data)
      ).rejects.toThrow("Invalid content");
    });

    it("should accept comment at max length (2000 chars)", async () => {
      // Arrange
      const data = {
        comment: "A".repeat(2000),
      };

      // Act
      const result = await BuyerQuoteSummaryValidations.validate(data);

      // Assert
      expect(result.comment).toBe("A".repeat(2000));
    });

    it("should accept comment with special characters", async () => {
      // Arrange
      const data = {
        comment: "Price: $100.50 & delivery in 2-3 days! Contact: test@example.com",
      };

      // Act
      const result = await BuyerQuoteSummaryValidations.validate(data);

      // Assert
      expect(result.comment).toBe("Price: $100.50 & delivery in 2-3 days! Contact: test@example.com");
    });
  });

  describe("sprDetails Validation", () => {
    describe("When SPR is disabled", () => {
      it("should not require SPR fields when spr is false", async () => {
        // Arrange
        const data = {
          sprDetails: {
            spr: false,
          },
        };

        // Act
        const result = await BuyerQuoteSummaryValidations.validate(data);

        // Assert
        expect(result.sprDetails?.spr).toBe(false);
      });

      it("should accept empty SPR fields when spr is false", async () => {
        // Arrange
        const data = {
          sprDetails: {
            spr: false,
            companyName: "",
            projectName: "",
            competitorNames: [],
            priceJustification: "",
          },
        };

        // Act
        const result = await BuyerQuoteSummaryValidations.validate(data);

        // Assert
        expect(result.sprDetails?.spr).toBe(false);
      });
    });

    describe("When SPR is enabled", () => {
      it("should require companyName when spr is true", async () => {
        // Arrange
        const data = {
          sprDetails: {
            spr: true,
            companyName: "",
            projectName: "Project A",
            competitorNames: ["Competitor 1"],
            priceJustification: "Justification",
          },
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("Invalid content");
      });

      it("should require projectName when spr is true", async () => {
        // Arrange
        const data = {
          sprDetails: {
            spr: true,
            companyName: "Company A",
            projectName: "",
            competitorNames: ["Competitor 1"],
            priceJustification: "Justification",
          },
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("Invalid content");
      });

      it("should require at least one competitor name when spr is true", async () => {
        // Arrange
        const data = {
          sprDetails: {
            spr: true,
            companyName: "Company A",
            projectName: "Project A",
            competitorNames: [],
            priceJustification: "Justification",
          },
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("Invalid content");
      });

      it("should require priceJustification when spr is true", async () => {
        // Arrange
        const data = {
          sprDetails: {
            spr: true,
            companyName: "Company A",
            projectName: "Project A",
            competitorNames: ["Competitor 1"],
            priceJustification: "",
          },
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("Invalid content");
      });

      it("should accept valid SPR details when spr is true", async () => {
        // Arrange
        const data = {
          sprDetails: {
            spr: true,
            companyName: "Company A",
            projectName: "Project A",
            competitorNames: ["Competitor 1", "Competitor 2"],
            priceJustification: "We offer better quality and service",
          },
        };

        // Act
        const result = await BuyerQuoteSummaryValidations.validate(data);

        // Assert
        expect(result.sprDetails?.companyName).toBe("Company A");
        expect(result.sprDetails?.projectName).toBe("Project A");
        expect(result.sprDetails?.competitorNames).toEqual(["Competitor 1", "Competitor 2"]);
        expect(result.sprDetails?.priceJustification).toBe("We offer better quality and service");
      });

      it("should reject companyName exceeding 250 characters", async () => {
        // Arrange
        const data = {
          sprDetails: {
            spr: true,
            companyName: "A".repeat(251),
            projectName: "Project A",
            competitorNames: ["Competitor 1"],
            priceJustification: "Justification",
          },
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("Invalid content");
      });

      it("should reject projectName exceeding 250 characters", async () => {
        // Arrange
        const data = {
          sprDetails: {
            spr: true,
            companyName: "Company A",
            projectName: "A".repeat(251),
            competitorNames: ["Competitor 1"],
            priceJustification: "Justification",
          },
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("Invalid content");
      });

      it("should reject priceJustification exceeding 1000 characters", async () => {
        // Arrange
        const data = {
          sprDetails: {
            spr: true,
            companyName: "Company A",
            projectName: "Project A",
            competitorNames: ["Competitor 1"],
            priceJustification: "A".repeat(1001),
          },
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("Invalid content");
      });

      it("should reject companyName with XSS content", async () => {
        // Arrange
        const data = {
          sprDetails: {
            spr: true,
            companyName: "<script>alert('XSS')</script>",
            projectName: "Project A",
            competitorNames: ["Competitor 1"],
            priceJustification: "Justification",
          },
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("Invalid content");
      });

      it("should reject projectName with XSS content", async () => {
        // Arrange
        const data = {
          sprDetails: {
            spr: true,
            companyName: "Company A",
            projectName: "<script>alert('XSS')</script>",
            competitorNames: ["Competitor 1"],
            priceJustification: "Justification",
          },
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("Invalid content");
      });

      it("should reject priceJustification with XSS content", async () => {
        // Arrange
        const data = {
          sprDetails: {
            spr: true,
            companyName: "Company A",
            projectName: "Project A",
            competitorNames: ["Competitor 1"],
            priceJustification: "<script>alert('XSS')</script>",
          },
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("Invalid content");
      });

      it("should reject competitorNames with XSS content", async () => {
        // Arrange
        const data = {
          sprDetails: {
            spr: true,
            companyName: "Company A",
            projectName: "Project A",
            competitorNames: ["Competitor 1", "<script>alert('XSS')</script>"],
            priceJustification: "Justification",
          },
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("Invalid content");
      });
    });
  });

  describe("products Validation", () => {
    describe("askedQuantity Validation", () => {
      it("should require askedQuantity", async () => {
        // Arrange
        const data = {
          products: [
            {
              packagingQuantity: 10,
              minOrderQuantity: 10,
              buyerRequestedPrice: 100,
            },
          ],
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("Quantity is required");
      });

      it("should enforce minimum order quantity", async () => {
        // Arrange
        const data = {
          products: [
            {
              askedQuantity: 5,
              packagingQuantity: 10,
              minOrderQuantity: 10,
              buyerRequestedPrice: 100,
            },
          ],
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("MOQ is 10");
      });

      it("should enforce maximum quantity limit", async () => {
        // Arrange
        const data = {
          products: [
            {
              askedQuantity: 10000000,
              packagingQuantity: 10,
              minOrderQuantity: 10,
              buyerRequestedPrice: 100,
            },
          ],
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("Quantity must be less than 9999999");
      });

      it("should enforce packaging quantity multiples", async () => {
        // Arrange
        const data = {
          products: [
            {
              askedQuantity: 15,
              packagingQuantity: 10,
              minOrderQuantity: 10,
              buyerRequestedPrice: 100,
            },
          ],
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("Enter in multiples of 10");
      });

      it("should accept valid quantity that is multiple of packaging", async () => {
        // Arrange
        const data = {
          products: [
            {
              askedQuantity: 20,
              packagingQuantity: 10,
              minOrderQuantity: 10,
              buyerRequestedPrice: 100,
            },
          ],
        };

        // Act
        const result = await BuyerQuoteSummaryValidations.validate(data);

        // Assert
        expect(result.products?.[0]?.askedQuantity).toBe(20);
      });

      it("should use packagingQuantity as MOQ when minOrderQuantity is not provided", async () => {
        // Arrange
        const data = {
          products: [
            {
              askedQuantity: 5,
              packagingQuantity: 10,
              buyerRequestedPrice: 100,
            },
          ],
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("MOQ is 10");
      });

      it("should handle decimal packaging quantities", async () => {
        // Arrange
        const data = {
          products: [
            {
              askedQuantity: 2.5,
              packagingQuantity: 0.5,
              minOrderQuantity: 0.5,
              buyerRequestedPrice: 100,
            },
          ],
        };

        // Act
        const result = await BuyerQuoteSummaryValidations.validate(data);

        // Assert
        expect(result.products?.[0]?.askedQuantity).toBe(2.5);
      });

      it("should handle tolerance for floating point calculations", async () => {
        // Arrange
        const data = {
          products: [
            {
              askedQuantity: 30.000001,
              packagingQuantity: 10,
              minOrderQuantity: 10,
              buyerRequestedPrice: 100,
            },
          ],
        };

        // Act
        const result = await BuyerQuoteSummaryValidations.validate(data);

        // Assert
        expect(result.products?.[0]?.askedQuantity).toBeCloseTo(30, 5);
      });
    });

    describe("buyerRequestedPrice Validation", () => {
      it("should require buyerRequestedPrice", async () => {
        // Arrange
        const data = {
          products: [
            {
              askedQuantity: 10,
              packagingQuantity: 10,
              minOrderQuantity: 10,
            },
          ],
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("Target price is required");
      });

      it("should accept valid price", async () => {
        // Arrange
        const data = {
          products: [
            {
              askedQuantity: 10,
              packagingQuantity: 10,
              minOrderQuantity: 10,
              buyerRequestedPrice: 99.99,
            },
          ],
        };

        // Act
        const result = await BuyerQuoteSummaryValidations.validate(data);

        // Assert
        expect(result.products?.[0]?.buyerRequestedPrice).toBe(99.99);
      });

      it("should reject non-numeric price", async () => {
        // Arrange
        const data = {
          products: [
            {
              askedQuantity: 10,
              packagingQuantity: 10,
              minOrderQuantity: 10,
              buyerRequestedPrice: "invalid",
            },
          ],
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("Must be a number");
      });

      it("should accept zero price", async () => {
        // Arrange
        const data = {
          products: [
            {
              askedQuantity: 10,
              packagingQuantity: 10,
              minOrderQuantity: 10,
              buyerRequestedPrice: 0,
            },
          ],
        };

        // Act
        const result = await BuyerQuoteSummaryValidations.validate(data);

        // Assert
        expect(result.products?.[0]?.buyerRequestedPrice).toBe(0);
      });
    });

    describe("Multiple Products Validation", () => {
      it("should validate multiple products", async () => {
        // Arrange
        const data = {
          products: [
            {
              askedQuantity: 10,
              packagingQuantity: 10,
              minOrderQuantity: 10,
              buyerRequestedPrice: 100,
            },
            {
              askedQuantity: 20,
              packagingQuantity: 5,
              minOrderQuantity: 5,
              buyerRequestedPrice: 50,
            },
          ],
        };

        // Act
        const result = await BuyerQuoteSummaryValidations.validate(data);

        // Assert
        expect(result.products).toHaveLength(2);
        expect(result.products?.[0]?.askedQuantity).toBe(10);
        expect(result.products?.[1]?.askedQuantity).toBe(20);
      });

      it("should reject if any product is invalid", async () => {
        // Arrange
        const data = {
          products: [
            {
              askedQuantity: 10,
              packagingQuantity: 10,
              minOrderQuantity: 10,
              buyerRequestedPrice: 100,
            },
            {
              askedQuantity: 3, // Invalid: less than MOQ
              packagingQuantity: 5,
              minOrderQuantity: 5,
              buyerRequestedPrice: 50,
            },
          ],
        };

        // Act & Assert
        await expect(
          BuyerQuoteSummaryValidations.validate(data)
        ).rejects.toThrow("MOQ is 5");
      });
    });
  });
});
