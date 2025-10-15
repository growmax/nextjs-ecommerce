import { coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";
export interface Module {
  userId: string | number;
  companyId: string | number;
}

export class ModuleService extends BaseService<ModuleService> {
  protected defaultClient = coreCommerceClient;
  async getModule(params: Module): Promise<unknown> {
    return this.call(
      `module_setting/getAllModuleSettings?userId=${params?.userId}&companyId=${params?.companyId}`,
      {}, // Empty body as per the original API route
      "GET"
    );
  }
}
export default ModuleService.getInstance();
