import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function TabsDemo() {
  return (
    <>
      <Card className="w-98 h-32">
        <Tabs defaultValue="account" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="account" variant="siemens" size="md">
              Account
            </TabsTrigger>
            <TabsTrigger value="password" variant="siemens" size="md">
              Password
            </TabsTrigger>
            <TabsTrigger value="settings" variant="siemens" size="md">
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">Account Info</TabsContent>
          <TabsContent value="password">Password Info</TabsContent>
          <TabsContent value="settings">Settings Info</TabsContent>
        </Tabs>
      </Card>
    </>
  );
}
