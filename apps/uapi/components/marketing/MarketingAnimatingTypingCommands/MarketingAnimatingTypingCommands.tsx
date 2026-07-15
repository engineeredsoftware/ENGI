import React from 'react';
import TypeIt from "typeit-react";

export default () => {
    return (
        <div className="border rounded py-3 bg-neutral-900 bg-opacity-50 font-mono !text-sm tracking-wide h-full min-h-60 mt-5 ml-5">
          <div className="flex items-center gap-x-2 mb-4 px-4">
            <span className="rounded-full w-3 h-3 bg-[#ec6a5e] inline-block" />
            <span className="rounded-full w-3 h-3 bg-[#f4bf4f] inline-block" />
            <span className="rounded-full w-3 h-3 bg-green-primary inline-block" />
          </div>
          <div className="px-6 leading-relaxed">
            <TypeIt
              options={{
                loopDelay: 1500,
                loop: true,
                speed: 20,
              }}
              getBeforeInit={(instance) => {
                instance
                  .type("🐙 Summarizing issue")
                  .break()
                  .pause(300)
                  .type("📥 Downloading code")
                  .break()
                  .pause(300)
                  .type("🔍 Researching documentation")
                  .break()
                  .pause(300)
                  .type("🪄 Implementing solution")
                  .break()
                  .pause(300)
                  .type("🧪 Validating solution")
                  .break()
                  .pause(300)
                  .type("🟢 Opening pull request")
                  .break()
                  .pause(300)
                  .type("💬 Leaving comment")

                return instance;
              }}
            />
        </div>
        </div>
    );
};
