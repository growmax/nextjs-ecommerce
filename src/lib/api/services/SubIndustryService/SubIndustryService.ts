import { coreCommerceClient } from "@/lib/api/client";
import { BaseService } from "@/lib/api/services/BaseService";

export class SubIndustryService extends BaseService<SubIndustryService> {
  protected defaultClient = coreCommerceClient;

  async getData(): Promise<unknown> {
    // avoid sending an empty object as GET body
    return this.call(`/subindustrys`, undefined, "GET");
  }
}

export default SubIndustryService.getInstance();
