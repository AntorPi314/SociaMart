// src/components/Socia.jsx
import CustomPost from "./socia/customPost.jsx";

export default function Socia() {
  return (
    <div className="w-[400px] h-full flex flex-col rounded-xl overflow-hidden bg-white">
      {/* Header Section */}
      <div className="h-20 flex items-center justify-between">
        <TopHeader />
      </div>

      {/* Post Feed */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 bg-[#EDF0F9] rounded-t-2xl border-t-8 border-[#EDF0F9]">
        <CustomPost
          name="Muhammad Yunus"
          image="https://placehold.co/55x55"
          meta="54 Liked | 15 June 2024 | 08:20 PM"
          text={`Muhammad http://google.com Yunus is a Bangladeshi economist, businessman and politician who has been serving as the Chief Adviser of the Interim government of Bangladesh since 8 August 2024. Yunus was awarded the Nobel Peace Prize in 2006 for founding the Grameen Bank and pioneering the concepts of microcredit and microfinance.`}
          liked={true}
        />
        <CustomPost
          name="Muhammad Yunus"
          image="https://placehold.co/55x55"
          meta="54 Liked | 15 June 2024 | 08:20 PM"
          text={`Muhammad http://google.com Yunus is a Bangladeshi economist, businessman and politician who has been serving as the Chief Adviser of the Interim government of Bangladesh since 8 August 2024. Yunus was awarded the Nobel Peace Prize in 2006 for founding the Grameen Bank and pioneering the concepts of microcredit and microfinance.`}
          liked={false}
        />
      </div>
    </div>
  );
}

function TopHeader() {
  return (
    <div className="w-full h-14 bg-white rounded-xl border border-neutral-300 flex items-center px-4 gap-4">
      <div className="w-10 h-10 bg-stone-300 rounded-full" />
      <p className="text-stone-400 text-lg font-inter">What's on your mind?</p>
    </div>
  );
}
