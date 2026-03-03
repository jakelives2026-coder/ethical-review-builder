import { RelationshipQuestion } from "./types";

export const businessTypeQuestions: Record<string, Record<string, RelationshipQuestion[]>> = {
  "restaurant": {
    customer: [
      {
        question: "What did you have?",
        subtitle: "Select what you ordered or experienced",
        placeholder: "I tried their signature dish...",
        options: [
          "I tried their signature dish and it was delicious.",
          "The food was fresh and well-prepared.",
          "Everything we ordered was great.",
          "The portions were generous and tasty.",
          "The menu had great options and the food delivered."
        ]
      },
      {
        question: "How was the service?",
        subtitle: "Select what stood out about the staff",
        placeholder: "Our server was friendly and attentive...",
        options: [
          "Our server was friendly and attentive.",
          "The staff was welcoming and made us feel at home.",
          "Service was quick and they checked on us regularly.",
          "Everyone was helpful and accommodating.",
          "The team was professional and friendly."
        ]
      },
      {
        question: "Would you go back?",
        subtitle: "Select your recommendation",
        placeholder: "Definitely coming back...",
        options: [
          "Definitely coming back.",
          "Already planning my next visit.",
          "Yes, I've already told friends about it.",
          "For sure, it's my new go-to spot.",
          "Absolutely, great food and great vibes."
        ]
      }
    ],
    acquaintance: [
      {
        question: "How do you know about this place?",
        subtitle: "Select how you're connected",
        placeholder: "I know the owner...",
        options: [
          "I know someone who works there and they take pride in what they do.",
          "I've seen their food on social media and it always looks amazing.",
          "Friends have been and always rave about it.",
          "They're known in the community for great food.",
          "I follow them online and love what they're doing."
        ]
      },
      {
        question: "What stands out about this place?",
        subtitle: "Select what you've noticed",
        placeholder: "They really care about quality...",
        options: [
          "They really care about quality and it shows.",
          "Their menu is creative and they use fresh ingredients.",
          "The vibe and atmosphere look inviting.",
          "They have a great reputation in the area.",
          "The owners are passionate about food."
        ]
      },
      {
        question: "Would you recommend it?",
        subtitle: "Select your confidence level",
        placeholder: "Yes, I'd definitely send friends there...",
        options: [
          "Yes, I'd definitely send friends there.",
          "Absolutely, everyone I know who's been loves it.",
          "For sure, it's on my list to visit soon.",
          "Yes, based on everything I've heard.",
          "Without a doubt."
        ]
      }
    ]
  },
  
  "retail": {
    customer: [
      {
        question: "What brought you in?",
        subtitle: "Select what you were looking for",
        placeholder: "I found exactly what I needed...",
        options: [
          "I found exactly what I was looking for.",
          "They had a great selection to choose from.",
          "I came in browsing and found something perfect.",
          "They had the product I needed in stock.",
          "The variety of options made it easy to find what I wanted."
        ]
      },
      {
        question: "How was your shopping experience?",
        subtitle: "Select what stood out",
        placeholder: "The staff was super helpful...",
        options: [
          "The staff was super helpful without being pushy.",
          "The store was clean and well-organized.",
          "Checkout was quick and easy.",
          "They went out of their way to help me find what I needed.",
          "Great prices and friendly service."
        ]
      },
      {
        question: "Would you shop there again?",
        subtitle: "Select your recommendation",
        placeholder: "Yes, I'll definitely be back...",
        options: [
          "Yes, I'll definitely be back.",
          "Already planning to return.",
          "Yes, I've recommended them to friends.",
          "For sure, great store.",
          "Absolutely, best shopping experience in a while."
        ]
      }
    ],
    acquaintance: [
      {
        question: "How do you know about this store?",
        subtitle: "Select how you're connected",
        placeholder: "I know the owners...",
        options: [
          "I know the people behind it and they're great.",
          "Friends shop there regularly and love it.",
          "I've seen what they carry and it looks quality.",
          "They're well-known locally for good products.",
          "I follow them online and like what they offer."
        ]
      },
      {
        question: "What stands out about them?",
        subtitle: "Select what you've noticed",
        placeholder: "They carry quality products...",
        options: [
          "They carry quality products you can't find elsewhere.",
          "The owners are passionate about what they sell.",
          "They're known for great customer service.",
          "Their prices are fair and products are good.",
          "They really care about their customers."
        ]
      },
      {
        question: "Would you recommend them?",
        subtitle: "Select your confidence level",
        placeholder: "Yes, I'd send friends there...",
        options: [
          "Yes, I'd send friends there.",
          "Absolutely, great local business.",
          "For sure, worth checking out.",
          "Yes, I've heard nothing but good things.",
          "Without a doubt."
        ]
      }
    ]
  },
  
  "professional-services": {
    customer: [
      {
        question: "What did they help you with?",
        subtitle: "Select the type of service",
        placeholder: "They helped me with an important matter...",
        options: [
          "They helped me navigate a complex situation.",
          "They provided expert advice when I needed it.",
          "They handled everything professionally and efficiently.",
          "They took care of something I couldn't do myself.",
          "They solved a problem I'd been dealing with."
        ]
      },
      {
        question: "What impressed you most?",
        subtitle: "Select what stood out",
        placeholder: "They explained everything clearly...",
        options: [
          "They explained everything clearly and patiently.",
          "They were responsive and easy to communicate with.",
          "They were thorough and didn't miss any details.",
          "They delivered results and followed through.",
          "They made a stressful process much easier."
        ]
      },
      {
        question: "Would you recommend them?",
        subtitle: "Select your recommendation level",
        placeholder: "Yes, I've already referred others...",
        options: [
          "Yes, I've already referred others to them.",
          "Absolutely, they earned my trust.",
          "Yes, I'd confidently recommend them.",
          "Without hesitation.",
          "Definitely, they really know their stuff."
        ]
      }
    ],
    acquaintance: [
      {
        question: "How do you know about them?",
        subtitle: "Select how you're connected",
        placeholder: "I know the team personally...",
        options: [
          "I know the team and they're incredibly capable.",
          "I've seen the results they deliver for others.",
          "They're well-regarded in their field.",
          "Colleagues have worked with them and speak highly.",
          "I've followed their work and been impressed."
        ]
      },
      {
        question: "What stands out about them?",
        subtitle: "Select what you've observed",
        placeholder: "They're experts in their field...",
        options: [
          "They're true experts in their field.",
          "They're known for being reliable and responsive.",
          "They genuinely care about their clients.",
          "Their reputation speaks for itself.",
          "They're professional and easy to work with."
        ]
      },
      {
        question: "Would you recommend them?",
        subtitle: "Select your confidence level",
        placeholder: "Yes, without hesitation...",
        options: [
          "Yes, without hesitation.",
          "Absolutely, I'd trust them with my own needs.",
          "Definitely, they come highly recommended.",
          "Yes, I've referred people to them before.",
          "For sure, top-notch professionals."
        ]
      }
    ]
  },
  
  "healthcare": {
    customer: [
      {
        question: "What was your visit for?",
        subtitle: "Select the type of care",
        placeholder: "I came in for a routine visit...",
        options: [
          "I came in for a routine visit and it was thorough.",
          "They helped me with a concern I had.",
          "I needed treatment and they took great care of me.",
          "It was a check-up and they were very thorough.",
          "They provided care for something I'd been dealing with."
        ]
      },
      {
        question: "How did they make you feel?",
        subtitle: "Select what stood out",
        placeholder: "They took their time and listened...",
        options: [
          "They took their time and really listened.",
          "I felt comfortable and cared for.",
          "They explained everything so I understood.",
          "The staff was warm and professional.",
          "They made what could be stressful feel easy."
        ]
      },
      {
        question: "Would you recommend them?",
        subtitle: "Select your recommendation",
        placeholder: "Yes, I've already told family about them...",
        options: [
          "Yes, I've already told family about them.",
          "Absolutely, great care and great people.",
          "Yes, I trust them completely.",
          "Definitely, they really care about patients.",
          "Without hesitation."
        ]
      }
    ],
    acquaintance: [
      {
        question: "How do you know about them?",
        subtitle: "Select how you're connected",
        placeholder: "Family members go there...",
        options: [
          "Family members go there and always have good experiences.",
          "I know people on the staff and they're great.",
          "Friends have recommended them highly.",
          "They have an excellent reputation in the community.",
          "I've heard great things from multiple people."
        ]
      },
      {
        question: "What stands out about them?",
        subtitle: "Select what you've heard",
        placeholder: "They genuinely care about patients...",
        options: [
          "They genuinely care about their patients.",
          "They take time to listen and explain things.",
          "The staff is known for being kind and professional.",
          "They're thorough and don't rush appointments.",
          "Everyone who goes there speaks highly of them."
        ]
      },
      {
        question: "Would you recommend them?",
        subtitle: "Select your confidence level",
        placeholder: "Yes, I'd send family there...",
        options: [
          "Yes, I'd send family there.",
          "Absolutely, based on what I've heard.",
          "Definitely, they come highly recommended.",
          "Yes, I trust the feedback I've received.",
          "Without a doubt."
        ]
      }
    ]
  },
  
  "home-services": {
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
    ]
  },
  
  "other": {
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
    ]
  }
};

export function getQuestionsForBusinessType(
  businessType: string,
  relationshipType: string
): RelationshipQuestion[] | null {
  const businessQuestions = businessTypeQuestions[businessType];
  if (!businessQuestions) return null;
  
  return businessQuestions[relationshipType] || null;
}

export function hasAppointmentFlows(businessType: string): boolean {
  return businessType === "home-services";
}
