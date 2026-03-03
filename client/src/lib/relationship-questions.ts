import { RelationshipQuestion } from "./types";

export const relationshipQuestions: Record<string, RelationshipQuestion[]> = {
  // Main appointment type (serves as fallback, same as appointment-before)
  appointment: [
    {
      question: "What stood out about the person who helped you?",
      subtitle: "Select what impressed you about the interaction",
      placeholder: "They were polite, friendly, and easy to talk to...",
      options: [
        "They were polite, friendly, and easy to talk to.",
        "They answered my questions clearly and patiently.",
        "They seemed honest and genuinely wanted to help.",
        "They made the process simple and low-pressure.",
        "They listened and didn't rush the conversation."
      ]
    },
    {
      question: "How did the interaction make you feel?",
      subtitle: "Select your emotional reaction to the interaction",
      placeholder: "I felt confident and comfortable moving forward...",
      options: [
        "I felt confident and comfortable moving forward.",
        "It gave me a great first impression of the business.",
        "I felt heard and understood.",
        "It was refreshing to talk with someone so professional.",
        "I left the call feeling reassured and optimistic."
      ]
    },
    {
      question: "Would you recommend this business based on the interaction?",
      subtitle: "Select your level of confidence in recommending them",
      placeholder: "Yes — first impressions really matter...",
      options: [
        "Yes — first impressions really matter.",
        "Definitely — they treated me with respect and care.",
        "Yes — I'd feel good referring others based on this interaction.",
        "Absolutely — even the first call was handled professionally.",
        "Without a doubt — they gave me every reason to trust them."
      ]
    }
  ],
  customer: [
    {
      question: "What did they help you with?",
      subtitle: "Select what service or product you received",
      placeholder: "They provided a helpful service I needed...",
      options: [
        "They provided a helpful service I needed.",
        "They delivered a product I had been looking for.",
        "They guided me through a process I wasn't familiar with.",
        "They helped solve a problem I was dealing with.",
        "They provided support or advice that made things easier."
      ]
    },
    {
      question: "What impressed you most about the experience?",
      subtitle: "Select what stood out to you",
      placeholder: "They were kind, professional, and easy to work with...",
      options: [
        "They were kind, professional, and easy to work with.",
        "They explained everything clearly and answered all my questions.",
        "The process was simple and smooth from start to finish.",
        "They followed through on what they promised.",
        "I felt taken care of and respected the entire time."
      ]
    },
    {
      question: "Would you recommend them to someone you know?",
      subtitle: "Select your recommendation level",
      placeholder: "Yes, I already have...",
      options: [
        "Yes, I already have.",
        "Definitely — they earned my trust.",
        "Yes — I'd gladly send friends or family their way.",
        "Without hesitation.",
        "Absolutely — they did a great job."
      ]
    }
  ],
  acquaintance: [
    {
      question: "How do you know about this business or the people behind it?",
      subtitle: "Select one that fits your situation",
      placeholder: "I know someone on their team...",
      options: [
        "I know someone on their team and have seen their professionalism firsthand.",
        "I follow their work on social media and see what they do regularly.",
        "I've referred others to them and heard great feedback.",
        "We've connected at local events or through mutual contacts.",
        "I've heard positive things mentioned locally about them."
      ]
    },
    {
      question: "What stands out to you about this business or team?",
      subtitle: "Select what you've observed about them",
      placeholder: "They come across as honest and truly care...",
      options: [
        "They come across as honest and truly care about doing great work.",
        "They consistently show up with professionalism and high standards.",
        "Their online presence shows professionalism that builds trust.",
        "They take the time to educate and support their audience.",
        "I've noticed their community involvement and professional presence."
      ]
    },
    {
      question: "Would you feel comfortable recommending them?",
      subtitle: "Select your confidence level",
      placeholder: "Yes, I already have...",
      options: [
        "Yes, I already have.",
        "Definitely — they've earned my confidence.",
        "Absolutely — I've seen enough to feel great recommending them.",
        "Yes — what I've seen from them has been impressive.",
        "Without a doubt."
      ]
    }
  ],
  "appointment-before": [
    {
      question: "What stood out about the person who helped you?",
      subtitle: "Select what impressed you about the interaction",
      placeholder: "They were polite, friendly, and easy to talk to...",
      options: [
        "They were polite, friendly, and easy to talk to.",
        "They answered my questions clearly and patiently.",
        "They seemed honest and genuinely wanted to help.",
        "They made the process simple and low-pressure.",
        "They listened and didn't rush the conversation."
      ]
    },
    {
      question: "How did the interaction make you feel?",
      subtitle: "Select your emotional reaction to the interaction",
      placeholder: "I felt confident and comfortable moving forward...",
      options: [
        "I felt confident and comfortable moving forward.",
        "It gave me a great first impression of the business.",
        "I felt heard and understood.",
        "It was refreshing to talk with someone so professional.",
        "I left the call feeling reassured and optimistic."
      ]
    },
    {
      question: "Would you recommend this business based on the interaction?",
      subtitle: "Select your level of confidence in recommending them",
      placeholder: "Yes — first impressions really matter...",
      options: [
        "Yes — first impressions really matter.",
        "Definitely — they treated me with respect and care.",
        "Yes — I'd feel good referring others based on this interaction.",
        "Absolutely — even the first call was handled professionally.",
        "Without a doubt — they gave me every reason to trust them."
      ]
    }
  ],
  "appointment-after-no-purchase": [
    {
      question: "Where did your meeting take place?",
      subtitle: "Select where you met with them",
      placeholder: "At my home...",
      options: [
        "At my home",
        "At their showroom or office",
        "Over the phone or video call",
        "At a job site or other location"
      ]
    },
    {
      question: "What happened during the appointment that stood out to you?",
      subtitle: "Select what impressed you during the appointment",
      placeholder: "They arrived on time and were well-prepared...",
      options: [
        "They arrived on time and were well-prepared.",
        "They explained everything clearly and answered my questions.",
        "They were polite, respectful, and made me feel comfortable.",
        "The appointment felt professional and low-pressure.",
        "They respected my time and space."
      ]
    },
    {
      question: "What was your impression after meeting with the team?",
      subtitle: "Select your reaction to the appointment experience",
      placeholder: "I felt confident about the company after meeting them...",
      options: [
        "I felt confident about the company after meeting them.",
        "They gave me everything I needed to make an informed decision.",
        "They were helpful without being pushy.",
        "I appreciated their honesty and approach.",
        "The appointment left a great impression."
      ]
    },
    {
      question: "Would you feel confident recommending them based on your experience?",
      subtitle: "Select your level of confidence in recommending them",
      placeholder: "Yes — they represented the business well...",
      options: [
        "Yes — they represented the business well.",
        "Absolutely — they made a great impression.",
        "Yes — they made me feel respected and informed.",
        "Definitely — they acted with professionalism throughout.",
        "Yes — it was a very helpful consultation."
      ]
    }
  ],
  "appointment-after-purchase-not-started": [
    {
      question: "Where did your meeting take place?",
      subtitle: "Select where you met with them",
      placeholder: "At my home...",
      options: [
        "At my home",
        "At their showroom or office",
        "Over the phone or video call",
        "At a job site or other location"
      ]
    },
    {
      question: "What made you feel confident choosing this company?",
      subtitle: "Select what impressed you about the process",
      placeholder: "They explained everything in detail...",
      options: [
        "They explained everything in detail and made me feel comfortable.",
        "They answered all my questions and didn't pressure me.",
        "Their professionalism stood out during the whole process.",
        "The quote and options were clear and easy to understand.",
        "The rep took the time to make sure I had everything I needed."
      ]
    },
    {
      question: "What was your experience like after saying yes?",
      subtitle: "Select your experience after making the purchase",
      placeholder: "The communication after booking has been great...",
      options: [
        "The communication after booking has been great.",
        "They sent helpful updates and made scheduling easy.",
        "I received all the paperwork and next steps clearly.",
        "They followed up quickly and made me feel supported.",
        "Everything has been organized and professional so far."
      ]
    },
    {
      question: "Would you recommend them based on what you've experienced so far?",
      subtitle: "Select your confidence level in recommending them",
      placeholder: "Yes — even before the job starts, I feel confident...",
      options: [
        "Yes — even before the job starts, I feel confident.",
        "Absolutely — I trust the process and the people.",
        "Yes — the experience so far has been top-notch.",
        "Definitely — they've been amazing from the start.",
        "Without a doubt — I'm excited to work with them."
      ]
    }
  ],

  "appointment-after-purchase": [
    {
      question: "Where did your meeting take place?",
      subtitle: "Select where you met with them",
      placeholder: "At my home...",
      options: [
        "At my home",
        "At their showroom or office",
        "Over the phone or video call",
        "At a job site or other location"
      ]
    },
    {
      question: "What did they help you with?",
      subtitle: "Select what service or product you received",
      placeholder: "They provided a helpful service I needed...",
      options: [
        "They provided a helpful service I needed.",
        "They delivered a product I had been looking for.",
        "They guided me through a process I wasn't familiar with.",
        "They helped solve a problem I was dealing with.",
        "They provided support or advice that made things easier."
      ]
    },
    {
      question: "What impressed you most about the experience?",
      subtitle: "Select what stood out to you",
      placeholder: "They were kind, professional, and easy to work with...",
      options: [
        "They were kind, professional, and easy to work with.",
        "They explained everything clearly and answered all my questions.",
        "The process was simple and smooth from start to finish.",
        "They followed through on what they promised.",
        "I felt taken care of and respected the entire time."
      ]
    },
    {
      question: "Would you recommend them to someone you know?",
      subtitle: "Select your recommendation level",
      placeholder: "Yes, I already have...",
      options: [
        "Yes, I already have.",
        "Definitely — they earned my trust.",
        "Yes — I'd gladly send friends or family their way.",
        "Without hesitation.",
        "Absolutely — they did a great job."
      ]
    }
  ]
};
