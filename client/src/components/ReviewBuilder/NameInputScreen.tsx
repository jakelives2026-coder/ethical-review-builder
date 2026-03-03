import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface NameInputScreenProps {
  onNext: (name: string) => void;
  onBack: () => void;
}

export function NameInputScreen({ onNext, onBack }: NameInputScreenProps) {
  const [name, setName] = useState("");
  
  const handleSubmit = () => {
    onNext(name.trim());
  };
  
  return (
    <div>
      <div className="pt-6 pb-4">
        <h2 className="text-2xl font-bold text-neutral-800 mb-3">Want to add your name to the review?</h2>
        <p className="text-neutral-600 mb-6">
          (Optional) Adding your name makes your review feel more personal.
        </p>
        
        <Card className="bg-white rounded-xl shadow-md p-4 mb-6">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3"
            placeholder="Your first name (optional)"
            autoFocus
          />
          
          <div className="text-sm text-neutral-500 flex items-start mb-2">
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-primary" />
            <p>
              This is optional, but can help make your review feel more personal.
            </p>
          </div>
          
          <div className="text-sm text-neutral-600 p-2 bg-primary-50 rounded border border-primary-100">
            Your name will appear at the end of the review, like: "- [Your Name]"
          </div>
        </Card>
      </div>
      
      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <Button
          onClick={handleSubmit}
          className="flex items-center"
        >
          Generate My Review
        </Button>
      </div>
    </div>
  );
}