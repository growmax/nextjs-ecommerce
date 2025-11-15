import { coreCommerceClient } from "../../client";
import { BaseService } from "../BaseService";

export class SubIndustryService extends BaseService<SubIndustryService> {
  protected defaultClient = coreCommerceClient;

  async getData(): Promise<unknown> {
    // avoid sending an empty object as GET body
    return this.call(`/subindustrys`, undefined, "GET");
  }
}

export default SubIndustryService.getInstance();
