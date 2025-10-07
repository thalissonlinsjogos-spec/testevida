// api/calcular.js

export default function handler(request, response) {
  // 1. Pegamos os dados que o site nos enviou (idade, renda, etc.)
  const {
    idade, renda, noKids,
    idade_f1, custo_f1, idade_f2, custo_f2, idade_f3, custo_f3,
    moradia, saude, lazer, vestuario,
    imoveis, carros, investimentos
  } = request.body;

  // 2. AQUI ESTÁ A SUA LÓGICA SECRETA - Ninguém na internet verá isso.
  // =================================================================
  function getRate(age) {
    age = Number(age);
    if (age < 18) return 0.0002296;
    if (age <= 25) return 0.0002296;
    if (age <= 29) return 0.00029001557;
    if (age <= 35) return 0.000316199;
    if (age <= 39) return 0.00038989;
    if (age <= 46) return 0.000622881;
    if (age <= 50) return 0.000942943;
    if (age <= 56) return 0.00144542;
    if (age <= 60) return 0.00212702;
    return 0.00319910;
  }

  function educTotal(ageChild, monthly) {
    const years = Math.max(0, 25 - ageChild);
    return years * (monthly * 12);
  }

  const totalEduF1 = noKids ? 0 : educTotal(idade_f1, custo_f1);
  const totalEduF2 = noKids ? 0 : educTotal(idade_f2, custo_f2);
  const totalEduF3 = noKids ? 0 : educTotal(idade_f3, custo_f3);
  const totalEduc = totalEduF1 + totalEduF2 + totalEduF3;

  const mensalVida = moradia + saude + lazer + vestuario;
  const totalVida = mensalVida * 60;

  const totalInvent = (imoveis + carros + investimentos) * 0.20;

  const cobertura = totalEduc + totalVida + totalInvent;
  const tarifa = getRate(idade);
  const mensalidade = cobertura * tarifa;
  const represent = renda > 0 ? (mensalidade / renda) : 0;
  // =================================================================

  // 3. Enviamos a resposta de volta para o site com todos os resultados.
  response.status(200).json({
    totalEduc: totalEduc,
    totalVida: totalVida,
    totalInvent: totalInvent,
    cobertura: cobertura,
    mensalidade: mensalidade,
    represent: represent,
  });
}