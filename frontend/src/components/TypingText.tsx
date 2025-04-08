import React, { useEffect, useState } from "react";

const phrases = [
  "Make me a schedule that allows me to spend more time with my family.",
  "Make me a schedule that lets me prioritize my hobbies.",
  "Make me a schedule that fits my energy levels.",
  "Make me a schedule that maximizes my productivity.",
];

const TypingText = () => {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const typingSpeed = isDeleting ? 30 : 70;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        const nextText = currentPhrase.slice(0, charIndex + 1);
        setText(nextText);
        setCharIndex(charIndex + 1);

        if (nextText === currentPhrase) {
          setTimeout(() => setIsDeleting(true), 1500); // Pause before deleting
        }
      } else {
        const nextText = currentPhrase.slice(0, charIndex - 1);
        setText(nextText);
        setCharIndex(charIndex - 1);

        if (charIndex === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex]);

  return (
    <h1 className="text-xl font-serif text-center">
      {text}
      <span className="blinking-cursor">|</span>
    </h1>
  );
};

export default TypingText;
