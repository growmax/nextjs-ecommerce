"use client";
import { SalesHeader } from "@/components/sales";
import { useRouter } from "next/navigation";
export default function QuoteSummaryContent(){
      const router = useRouter();
     const handleClose=()=>{
        router.push(`/cart`);
    }
    const handleRequestQuote=()=>{

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
            onClick:handleClose,
          },
          {
            label: "REQUEST FOR QUOTE",
            variant: "default",
            onClick: handleRequestQuote,
          },
        ]}
           />
        </div>
    )
}