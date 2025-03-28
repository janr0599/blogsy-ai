import { Dot } from "lucide-react";
import React from "react";

export default function Divider() {
    return (
        <div className="flex items-center justify-center">
            <Dot className="text-purple-400" />
            <Dot className="text-purple-400" />
            <Dot className="text-purple-400" />
        </div>
    );
}
