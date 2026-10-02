"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function ScentGuide() {
  const t = useTranslations("Studio");
  const p = useTranslations("Products");
  const q = useTranslations("Quiz");
  const [answers, setAnswers] = useState<number[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const hasInteracted = useRef(false);
  const complete = answers.length === 3;
  const step = answers.length + 1;
  const match = answers[1] === 0 && answers[0] !== 2 ? "perfume" : answers[2] === 0 && answers[0] !== 2 ? "polo" : "pack";
  const result = match === "perfume" ? { name: p("perfumeTitle"), description: p("perfumeDesc"), image: "/perfume.webp", anchor: "spikenard" } : match === "polo" ? { name: p("poloTitle"), description: p("poloDesc"), image: "/polo.webp", anchor: "polo" } : { name: q("matchPack"), description: q("packDesc"), image: "/sovereign-pack.webp", anchor: "sovereign" };

  useEffect(() => { if (hasInteracted.current) heading.current?.focus({ preventScroll: true }); }, [answers.length]);

  const choose = (answer: number) => { hasInteracted.current = true; setAnswers([...answers, answer]); };
  return <div className="scent-guide">
    <div className="guide-progress"><span>{complete ? t("yourSelection") : t("step", { current: step, total: 3 })}</span><div aria-hidden="true">{[1, 2, 3].map(index => <i key={index} data-active={answers.length >= index || step === index} />)}</div></div>
    {complete ? <div className="guide-result"><Image src={result.image} width={420} height={420} alt={result.name} /><div><h3 ref={heading} tabIndex={-1}>{result.name}</h3><p>{result.description}</p><a className="text-link" href={`#${result.anchor}`}>{t("seeDetails")} <span aria-hidden="true">↗</span></a></div></div> : <div className="guide-question"><h3 ref={heading} id="question-heading" tabIndex={-1}>{t(`question${step}`)}</h3><div className="guide-answers" role="group" aria-labelledby="question-heading">{[0, 1, 2].map(index => <button key={`${step}-${index}`} type="button" onClick={() => choose(index)}><span className="answer-number">0{index + 1}</span><span>{t(`answer${step}${index + 1}`)}</span><span aria-hidden="true">↗</span></button>)}</div></div>}
    <div className="guide-bottom">{answers.length > 0 ? <button type="button" className="text-link" onClick={() => { hasInteracted.current = true; setAnswers(complete ? [] : answers.slice(0, -1)); }}>{complete ? t("restart") : t("back")}</button> : <span>{t("guidePrivacy")}</span>}<span>{complete ? "03 / 03" : `0${step} / 03`}</span></div>
  </div>;
}
