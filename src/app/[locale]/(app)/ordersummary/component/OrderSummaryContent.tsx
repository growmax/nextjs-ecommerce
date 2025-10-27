"use client";
import { SalesHeader } from "@/components/sales";
import { useRouter } from "next/navigation";
export default function OrderSummaryContent(){
     const router = useRouter();
    const handlePlaceOrder=()=>{
        
    }
    const handleClose=()=>{
        router.push(`/cart`);
    }
    return(
        <div>
               <SalesHeader
                     title={"Blue Quote"}
                     identifier={""}
                       buttons={[
                    {
                      label: "CANCEL",
                      variant: "outline",
                      onClick: handleClose,
                    },
                    {
                      label: "PLACE ORDER",
                      variant: "default",
                      onClick: handlePlaceOrder,
                    },
                  ]}
                     />
        </div>
    )
}