// 받침에 따라 조사 고르기: josa('그로타', '와', '과') → '그로타와'
export function josa(word, withoutBatchim, withBatchim) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const has = code >= 0 && code <= 11171 && code % 28 !== 0;
  return word + (has ? withBatchim : withoutBatchim);
}
