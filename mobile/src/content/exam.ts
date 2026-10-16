/*
 * Ported verbatim from the reviewed desktop dashboard (app/index.html, PR #1).
 * Strings use String.raw so LaTeX backslashes survive; Markdown code fences
 * inside template literals use "~~~" because backticks would end the literal.
 */
import type { ExamCategory, ExamItem } from './types';

const R = String.raw;

/* =========================================================================
   DATA · PhD Qualifying Exam Questions & Interview Prep
   difficulty: 1 (warm-up) … 5 (research-level)
   ========================================================================= */
export const EXAM_CATEGORIES: ExamCategory[] = [
  { id: 'qual',      label: 'Qualifying Exam',       blurb: 'Written and oral qualifier problems, by research domain.' },
  { id: 'admission', label: 'PhD Admission Interview', blurb: 'Questions typical of interviews at research-intensive departments.' },
  { id: 'postdoc',   label: 'Postdoc Scenarios',      blurb: 'Research-talk, teaching and collaboration scenarios for postdoctoral interviews.' },
  { id: 'jobs',      label: 'Job Postings (simulated)', blurb: 'Simulated postings for practice. These are not real vacancies.' }
];

export const DIFFICULTY: string[] = ['', 'Warm-up', 'Standard', 'Hard', 'Very hard', 'Research-level'];

export const EXAM: ExamItem[] = [
  /* ------------------------------------------------ Qualifying exam */
  {
    id: 'q-hasse', cat: 'qual', domain: 'cnt', difficulty: 4,
    title: "Hasse's bound and the zeta function of an elliptic curve",
    statement: R`Let $E/\mathbb{F}_p$ be an elliptic curve and $t=p+1-\#E(\mathbb{F}_p)$.

1. Prove that the number of points on $E$ over $\mathbb{F}_p$ satisfies $\#E(\mathbb{F}_p)=p+1-t$ where $|t|\le 2\sqrt p$.
2. Deduce that $\#E(\mathbb{F}_{p^n})=p^n+1-\alpha^n-\bar\alpha^{\,n}$, where $\alpha,\bar\alpha$ are the roots of $T^2-tT+p$.
3. Show that $Z(E/\mathbb{F}_p,T)=\dfrac{1-tT+pT^2}{(1-T)(1-pT)}$ and that its zeros satisfy $|T|=p^{-1/2}$.`,
    outline: R`1. Let $\pi$ be the $p$-power Frobenius. Then $E(\mathbb{F}_p)=\ker(1-\pi)$, and $1-\pi$ is **separable** (its pullback on the invariant differential is $1\neq 0$), so $\#E(\mathbb{F}_p)=\deg(1-\pi)$.
2. $\deg:\operatorname{End}(E)\to\mathbb{Z}$ is a positive-definite quadratic form with $\deg(m-n\pi)=m^2-mnt+n^2p\ge 0$ for all $m,n\in\mathbb{Z}$, where $t=1+p-\deg(1-\pi)$.
3. By homogeneity this holds for all $(m,n)\in\mathbb{Q}^2$ and by continuity for $\mathbb{R}^2$; a nonnegative binary quadratic form has discriminant $t^2-4p\le 0$.
4. $\pi$ satisfies $\pi^2-t\pi+p=0$; for a prime $\ell\neq p$, the action on the Tate module $T_\ell E$ has eigenvalues $\alpha,\bar\alpha$ with $\alpha\bar\alpha=p$, $\alpha+\bar\alpha=t$, hence $\deg(1-\pi^n)=\det(1-\pi^n\mid T_\ell E)=(1-\alpha^n)(1-\bar\alpha^n)$.
5. Summing $\log Z(T)=\sum_n \#E(\mathbb{F}_{p^n})T^n/n$ gives the rational form; $|\alpha|=\sqrt p$ because $t^2\le 4p$ makes the roots complex conjugate (or equal).`,
    refs: ['J. H. Silverman, *The Arithmetic of Elliptic Curves*, 2nd ed., GTM 106, §V.1–V.2', 'L. C. Washington, *Elliptic Curves: Number Theory and Cryptography*, 2nd ed., Ch. 4']
  },
  {
    id: 'q-rlwe', cat: 'qual', domain: 'pqc', difficulty: 5,
    title: 'Ring-LWE and worst-case ideal lattices',
    statement: R`Let $K=\mathbb{Q}(\zeta_m)$, $R=\mathcal{O}_K=\mathbb{Z}[\zeta_m]$, $n=\varphi(m)$, and let $q\equiv 1\pmod m$ be a prime with $q=\mathrm{poly}(n)$. Describe the security reduction from Ring-LWE to worst-case lattice problems: state the main theorem of Lyubashevsky–Peikert–Regev, sketch the quantum reduction from approximate $\mathsf{SVP}$ on ideal lattices to search Ring-LWE, and explain the search-to-decision step and where the hypotheses on $q$ and on the error distribution are used.`,
    outline: R`1. **Statement.** For $\alpha q\ge\omega(\sqrt{\log n})$ there is a quantum reduction from $\widetilde O(\sqrt n/\alpha)$-approximate $\mathsf{SVP}$ on ideal lattices in $K$ to search $\mathsf{R\text{-}LWE}_{q,\Psi_{\le\alpha}}$, i.e. for every elliptical Gaussian error in the canonical embedding with all parameters $\le\alpha q$ (the iterative step produces such non-spherical errors); the decision version holds for a random elliptical error $\Upsilon_\alpha$, or for a spherical Gaussian of width $\approx\alpha q\,(n\ell/\log(n\ell))^{1/4}$ when only $\ell$ samples are given.
2. **Iterative step** (as in Regev): given discrete Gaussian samples $D_{\mathfrak{I},r}$ on an ideal $\mathfrak{I}$, the R-LWE oracle solves $\mathsf{BDD}$ on the dual ideal $\mathfrak{I}^\vee$ at distance $\approx\alpha q/r$.
3. **Quantum step:** a BDD solver on $\mathfrak{I}^\vee$ yields, via the quantum Fourier transform, samples from $D_{\mathfrak{I},r'}$ with $r'<r$; iterate until $r\approx\sqrt n\,\eta(\mathfrak{I})/\alpha$, where short vectors are found.
4. **Search to decision:** $q$ splits completely, $R_q\cong\bigoplus_{i=1}^{n}R/\mathfrak{q}_i$; guess $s\bmod\mathfrak{q}_i$ (only $q$ options) and test with the decision oracle via a hybrid over the CRT components. Galois automorphisms permute the $\mathfrak{q}_i$ transitively and preserve the spherical error, so one $\mathfrak{q}_i$ suffices.
5. Remarks: the reduction is to ideal lattices only (whose SVP might be easier); Peikert–Regev–Stephens-Davidowitz (2017) later removed the splitting hypothesis on $q$.`,
    refs: ['V. Lyubashevsky, C. Peikert, O. Regev, "On ideal lattices and learning with errors over rings", EUROCRYPT 2010; J. ACM 60 (2013)', 'O. Regev, "On lattices, learning with errors, random linear codes, and cryptography", J. ACM 56 (2009)', 'C. Peikert, O. Regev, N. Stephens-Davidowitz, "Pseudorandomness of Ring-LWE for any ring and modulus", STOC 2017']
  },
  {
    id: 'q-gnfs', cat: 'qual', domain: 'cnt', difficulty: 4,
    title: 'Runtime of the General Number Field Sieve',
    statement: R`Analyze the runtime complexity of the General Number Field Sieve. Assuming that the values $a-bm$ and $F(a,b)=b^{d}f(a/b)$ are smooth with the same probability as random integers of the same size, show that optimal choices of the degree $d$, the smoothness bound $B$ and the sieve region give
$$T(N)=L_N\!\left[\tfrac13,\ \left(\tfrac{64}{9}\right)^{1/3}\right].$$`,
    outline: R`1. Base-$m$ polynomial: $m\approx N^{1/d}$, coefficients of $f$ are $O(N^{1/d})$. For $|a|,|b|\le U$: $|a-bm|\lesssim UN^{1/d}$ and $|F(a,b)|\lesssim (d+1)U^{d}N^{1/d}$; the product is $\approx U^{d+1}N^{2/d}$.
2. Need about $\pi(B)$ relations (plus units and characters) from $U^2$ pairs: $U^2\,\rho(u)\gtrsim B$ with $u=\log(U^{d+1}N^{2/d})/\log B$; linear algebra costs $B^{2+o(1)}$, balanced against sieving $U^{2}\approx B^{2}$, so $U\approx B$.
3. Set $\log B=\beta(\log N)^{1/3}(\log\log N)^{2/3}$ and $d=\delta(\log N/\log\log N)^{1/3}$. Then $\log\big(U^{d+1}N^{2/d}\big)\approx(\beta\delta+2/\delta)(\log N)^{2/3}(\log\log N)^{1/3}$, and with $\rho(u)=u^{-u(1+o(1))}$,
$$u\log u\approx\tfrac13\Big(\delta+\frac{2}{\beta\delta}\Big)(\log N)^{1/3}(\log\log N)^{2/3}.$$
The condition $U^2\rho(u)\gtrsim B$ with $U=B$ becomes $\beta\ge\frac13\big(\delta+\frac{2}{\beta\delta}\big)$. The optimum $\delta=\sqrt{2/\beta}$ gives $\beta^3=8/9$ and $\delta=3^{1/3}$, so the total cost is $B^{2+o(1)}=L_N\big[\tfrac13,2\beta\big]=L_N\big[\tfrac13,(64/9)^{1/3}\big]$, with $(64/9)^{1/3}\approx1.923$.
4. Mention the heuristic gaps: smoothness of polynomial values, the square-root step in $\mathbb{Z}[\alpha]$ (Couveignes/Montgomery), and that the special NFS achieves $(32/9)^{1/3}$.`,
    refs: ['A. K. Lenstra, H. W. Lenstra Jr. (eds.), *The Development of the Number Field Sieve*, LNM 1554 (1993)', 'R. Crandall, C. Pomerance, *Prime Numbers: A Computational Perspective*, 2nd ed., §6.2']
  },
  {
    id: 'q-zeta1', cat: 'qual', domain: 'ant', difficulty: 3,
    title: 'Non-vanishing of ζ on the 1-line',
    statement: R`Prove that $\zeta(1+it)\neq 0$ for every real $t\neq 0$. Then explain how a quantitative version yields a zero-free region $\sigma>1-\dfrac{c}{\log(|t|+2)}$ and the error term $\pi(x)=\operatorname{Li}(x)+O\big(xe^{-c'\sqrt{\log x}}\big)$.`,
    outline: R`1. For $\sigma>1$: $\log|\zeta(\sigma+it)|=\sum_{p,k}\frac{\cos(kt\log p)}{kp^{k\sigma}}$.
2. Since $3+4\cos\theta+\cos2\theta=2(1+\cos\theta)^2\ge 0$, we get $|\zeta(\sigma)^3\zeta(\sigma+it)^4\zeta(\sigma+2it)|\ge 1$.
3. If $\zeta(1+it)=0$: as $\sigma\to1^+$, $\zeta(\sigma)^3\sim(\sigma-1)^{-3}$, $\zeta(\sigma+it)^4=O((\sigma-1)^4)$, $\zeta(\sigma+2it)=O(1)$, so the product $\to 0$: contradiction.
4. Quantitative: apply the same inequality to $-\Re\frac{\zeta'}{\zeta}$ with the partial-fraction bound $-\Re\frac{\zeta'}{\zeta}(s)\le A\log|t|-\sum_\rho\Re\frac{1}{s-\rho}$ (Hadamard product), isolate a zero $\beta+i\gamma$, and choose $\sigma=1+\frac{\delta}{\log|\gamma|}$.
5. Perron's formula with a contour hugging the zero-free region yields the stated error term.`,
    refs: ['H. Davenport, *Multiplicative Number Theory*, 3rd ed., GTM 74, Ch. 13 and 18', 'E. C. Titchmarsh, *The Theory of the Riemann Zeta-Function*, 2nd ed., Ch. III']
  },
  {
    id: 'q-classgroup', cat: 'qual', domain: 'algnt', difficulty: 3,
    title: 'Class group of Q(√−5) and Minkowski finiteness',
    statement: R`Let $K=\mathbb{Q}(\sqrt{-5})$.

1. Show $\mathcal{O}_K=\mathbb{Z}[\sqrt{-5}]$ and $d_K=-20$.
2. Factor $(2)$, $(3)$ and $(1\pm\sqrt{-5})$ into prime ideals, and explain how $6=2\cdot3=(1+\sqrt{-5})(1-\sqrt{-5})$ is reconciled at the level of ideals.
3. Prove $\operatorname{Cl}(K)\cong\mathbb{Z}/2\mathbb{Z}$, and prove in general that $\operatorname{Cl}(K)$ is finite using the Minkowski bound $M_K=\sqrt{|d_K|}\big(\tfrac4\pi\big)^{r_2}\tfrac{n!}{n^n}$.`,
    outline: R`1. $-5\equiv 3\pmod 4$, so $\mathcal{O}_K=\mathbb{Z}[\sqrt{-5}]$ and $d_K=4\cdot(-5)=-20$.
2. Kummer–Dedekind with $x^2+5$: mod $2$, $(x+1)^2$ gives $(2)=\mathfrak{p}_2^2$, $\mathfrak{p}_2=(2,1+\sqrt{-5})$; mod $3$, $(x-1)(x+1)$ gives $(3)=\mathfrak{p}_3\mathfrak{p}_3'$ with $\mathfrak{p}_3=(3,1+\sqrt{-5})$. Norms give $(1+\sqrt{-5})=\mathfrak{p}_2\mathfrak{p}_3$, $(1-\sqrt{-5})=\mathfrak{p}_2\mathfrak{p}_3'$, so both factorizations of $6$ equal $\mathfrak{p}_2^2\mathfrak{p}_3\mathfrak{p}_3'$.
3. $M_K=\frac{2}{\pi}\sqrt{20}\approx 2.85$, so $\operatorname{Cl}(K)$ is generated by primes of norm $\le 2$, i.e. by $[\mathfrak{p}_2]$. $\mathfrak{p}_2$ is not principal ($x^2+5y^2=2$ has no solution) and $\mathfrak{p}_2^2=(2)$, so $h_K=2$.
4. General finiteness: Minkowski's convex body theorem applied to the lattice $\sigma(\mathfrak{a})\subset\mathbb{R}^{r_1}\times\mathbb{C}^{r_2}$ yields $x\in\mathfrak{a}$ with $|N(x)|\le M_K N(\mathfrak{a})$; then $(x)\mathfrak{a}^{-1}$ is integral of norm $\le M_K$, and there are finitely many such ideals.`,
    refs: ['D. A. Marcus, *Number Fields*, 2nd ed., Ch. 3 and 5', 'J. Neukirch, *Algebraic Number Theory*, Grundlehren 322, §I.5–I.6']
  },
  {
    id: 'q-mov', cat: 'qual', domain: 'crypto', difficulty: 4,
    title: 'Supersingular curves and the MOV reduction',
    statement: R`Let $p\ge 5$ and let $E/\mathbb{F}_p$ be supersingular. Show that $\#E(\mathbb{F}_p)=p+1$ and that for every prime $\ell>2$ dividing $\#E(\mathbb{F}_p)$ the embedding degree, i.e. the order of $p$ in $(\mathbb{Z}/\ell\mathbb{Z})^\times$, equals $2$. Explain how the Weil pairing reduces the ECDLP in $E(\mathbb{F}_p)[\ell]$ to a DLP in $\mathbb{F}_{p^2}^\times$, and what this implies for cryptographic parameter choices.`,
    outline: R`1. Supersingular over $\mathbb{F}_p$ $\iff$ $p\mid t$. Hasse gives $|t|\le 2\sqrt p<p$ for $p\ge5$, so $t=0$ and $\#E=p+1$.
2. $\ell\mid p+1$ gives $p\equiv -1\pmod\ell$; as $\ell>2$, $p\not\equiv 1$, so $\operatorname{ord}_\ell(p)=2$ and $\mu_\ell\subset\mathbb{F}_{p^2}^\times$.
3. The Weil pairing $e_\ell:E[\ell]\times E[\ell]\to\mu_\ell$ is bilinear, alternating, non-degenerate, and $E[\ell]\subseteq E(\mathbb{F}_{p^2})$. With $P$ of order $\ell$ choose $Q$ (for instance via a distortion map) with $e_\ell(P,Q)\neq 1$; if $R=xP$ then $e_\ell(R,Q)=e_\ell(P,Q)^{x}$.
4. Index calculus/NFS in $\mathbb{F}_{p^2}^\times$ is subexponential, so supersingular curves with small $p$ are weak for ECDLP; pairing-based cryptography instead *uses* small embedding degree on purpose and sizes $p^k$ against NFS variants.`,
    refs: ['A. Menezes, T. Okamoto, S. Vanstone, "Reducing elliptic curve logarithms to logarithms in a finite field", IEEE Trans. Inf. Theory 39 (1993)', 'S. D. Galbraith, *Mathematics of Public Key Cryptography*, Cambridge Univ. Press (2012)']
  },

  /* ------------------------------------------------ PhD admission interview */
  {
    id: 'a-cyclo', cat: 'admission', domain: 'ant', difficulty: 2,
    title: 'Primes congruent to 1 modulo n',
    statement: R`Without using Dirichlet's theorem, prove that for every $n\ge 1$ there are infinitely many primes $p\equiv 1\pmod n$. *Hint:* consider the cyclotomic polynomial $\Phi_n(x)=\prod_{(k,n)=1}(x-\zeta_n^k)\in\mathbb{Z}[x]$.`,
    outline: R`1. **Key lemma:** if $p$ is a prime with $p\nmid n$ and $p\mid\Phi_n(a)$, then $\operatorname{ord}_p(a)=n$, hence $n\mid p-1$. (Since $x^n-1$ is separable mod $p$, $a$ cannot be a root of $\Phi_d$ for a proper divisor $d\mid n$.)
2. Given primes $p_1,\dots,p_k\equiv 1\pmod n$, let $a=N\,n\,p_1\cdots p_k$ with $N$ large enough that $|\Phi_n(a)|>1$.
3. $\Phi_n(a)\equiv\Phi_n(0)=\pm1\pmod{a}$ for $n\ge2$, so any prime $p\mid\Phi_n(a)$ is coprime to $n p_1\cdots p_k$, and by the lemma $p\equiv1\pmod n$ is new.`,
    refs: ['K. Ireland, M. Rosen, *A Classical Introduction to Modern Number Theory*, 2nd ed., GTM 84, Ch. 13', 'Folklore; see also L. C. Washington, *Introduction to Cyclotomic Fields*, GTM 83']
  },
  {
    id: 'a-qr', cat: 'admission', domain: 'algnt', difficulty: 2,
    title: 'Quadratic reciprocity via Gauss sums',
    statement: R`State the law of quadratic reciprocity for distinct odd primes $p,q$ and sketch a proof using the Gauss sum $g=\sum_{a=1}^{p-1}\left(\frac{a}{p}\right)\zeta_p^{a}$. What is the interpretation in terms of the splitting of $q$ in $\mathbb{Q}(\sqrt{p^*})\subseteq\mathbb{Q}(\zeta_p)$, $p^*=(-1)^{(p-1)/2}p$?`,
    outline: R`1. Statement: $\left(\frac pq\right)\left(\frac qp\right)=(-1)^{\frac{p-1}2\cdot\frac{q-1}2}$.
2. $g^2=p^*$ (expand and use $\sum_a\zeta_p^{ac}=0$ for $p\nmid c$).
3. In $\mathbb{Z}[\zeta_p]/(q)$: $g^q\equiv\sum\left(\frac ap\right)\zeta_p^{aq}=\left(\frac qp\right)g$. Also $g^{q-1}=(p^*)^{(q-1)/2}\equiv\left(\frac{p^*}{q}\right)\pmod q$. Divide by $g$ (invertible since $g^2=p^*$ is prime to $q$) to get $\left(\frac{p^*}{q}\right)=\left(\frac qp\right)$.
4. Galois view: $\operatorname{Frob}_q\in\operatorname{Gal}(\mathbb{Q}(\zeta_p)/\mathbb{Q})\cong(\mathbb{Z}/p)^\times$ is $q$; it fixes $\sqrt{p^*}$ iff $q$ is a square mod $p$, iff $q$ splits in $\mathbb{Q}(\sqrt{p^*})$, iff $\left(\frac{p^*}{q}\right)=1$.`,
    refs: ['K. Ireland, M. Rosen, *A Classical Introduction to Modern Number Theory*, Ch. 6', 'J.-P. Serre, *A Course in Arithmetic*, GTM 7, Ch. I']
  },
  {
    id: 'a-primality', cat: 'admission', domain: 'cnt', difficulty: 2,
    title: 'Why is primality easy but factoring hard?',
    statement: R`Explain why deciding primality is in $\mathsf{P}$ while factoring is believed hard. Describe the Miller–Rabin test, prove that an odd prime $n$ always passes, and state the bound on strong liars for odd composite $n$. What changes under GRH?`,
    outline: R`1. For prime $n$, $\mathbb{Z}/n\mathbb{Z}$ is a field, so $x^2=1$ only for $x=\pm1$; the sequence $a^{d},a^{2d},\dots,a^{2^{s}d}=a^{n-1}=1$ therefore hits $1$ first from $-1$ or starts at $1$.
2. For odd composite $n>9$, at most $\varphi(n)/4$ bases are strong liars (Monier, Rabin), so $k$ random rounds err with probability $\le 4^{-k}$.
3. Under GRH, testing all bases $a\le 2\log^2 n$ is deterministic (Miller; Bach's constant). AKS (2002) removed GRH entirely.
4. Factoring: no polynomial algorithm is known; the best heuristic is $L_N[1/3,1.923]$. Primality tests certify *existence* of a factorization without producing one; this gap underlies RSA.`,
    refs: ['M. O. Rabin, "Probabilistic algorithm for testing primality", J. Number Theory 12 (1980)', 'M. Agrawal, N. Kayal, N. Saxena, "PRIMES is in P", Ann. of Math. 160 (2004)', 'R. Crandall, C. Pomerance, *Prime Numbers*, Ch. 3–4']
  },
  {
    id: 'a-lattice', cat: 'admission', domain: 'pqc', difficulty: 3,
    title: 'Explaining lattice cryptography to a committee',
    statement: R`A committee member outside cryptography asks: *why should lattice problems resist quantum computers when factoring does not, and what does "worst-case to average-case reduction" mean?* Give a precise but accessible answer, mentioning $\mathsf{SVP}_\gamma$, $\mathsf{LWE}$ and the hidden subgroup problem.`,
    outline: R`1. Shor's algorithm solves the hidden subgroup problem in finite **abelian** groups; factoring and discrete logs reduce to it.
2. Lattice problems relate to the **dihedral** hidden subgroup problem (Regev, 2004), for which only subexponential algorithms are known (Kuperberg: $2^{O(\sqrt{\log N})}$).
3. Worst-case to average-case (Ajtai, 1996; Regev, 2005): breaking a *random* instance of SIS (classical reduction, Ajtai) or LWE (a *quantum* reduction, Regev; classical for $\mathsf{GapSVP}$ with exponential modulus, Peikert 2009) with noticeable probability yields an algorithm for $\mathsf{GapSVP}_\gamma$ and $\mathsf{SIVP}_\gamma$ on *every* lattice. So a key-generation procedure that samples random instances inherits worst-case hardness.
4. Caveats: the approximation factors $\gamma=\mathrm{poly}(n)$ are far from those of NP-hardness results, and concrete parameters are chosen by cryptanalysis (BKZ cost), not by the reduction.`,
    refs: ['M. Ajtai, "Generating hard instances of lattice problems", STOC 1996', 'D. Micciancio, O. Regev, "Lattice-based cryptography", in *Post-Quantum Cryptography*, Springer (2009)', 'C. Peikert, "A decade of lattice cryptography", Found. Trends Theor. Comput. Sci. 10 (2016)']
  },

  /* ------------------------------------------------ Postdoc scenarios */
  {
    id: 'p-gaps', cat: 'postdoc', domain: 'ant', difficulty: 4,
    title: 'Five-minute pitch: bounded gaps between primes',
    statement: R`You have five minutes in a job talk to explain how the Maynard–Tao sieve proves $\liminf_{n\to\infty}(p_{n+1}-p_n)<\infty$ and why sieve methods alone cannot reach $2$. Structure the explanation and state the key inequality.`,
    outline: R`1. Admissible $k$-tuple $\mathcal{H}=\{h_1,\dots,h_k\}$; goal: infinitely many $n$ with at least two of $n+h_i$ prime.
2. Multidimensional weights $w_n=\Big(\sum_{d_i\mid n+h_i}\lambda_{d_1,\dots,d_k}\Big)^2$ with $\lambda_{\mathbf d}\approx\mu(d_1)\cdots\mu(d_k)F\big(\tfrac{\log d_1}{\log R},\dots,\tfrac{\log d_k}{\log R}\big)$.
3. Compare $S_2=\sum_n w_n\sum_i\mathbf 1_{\mathbb P}(n+h_i)$ with $S_1=\sum_n w_n$. With level of distribution $\theta$, one gets $S_2/S_1\to\frac{\theta}{2}M_k$; if $M_k>\frac{2m}{\theta}$ then infinitely often $m+1$ of the $n+h_i$ are prime.
4. Bombieri–Vinogradov gives every $\theta<\tfrac12$, so $M_k>4$ suffices; $M_{105}>4$ gives gaps $\le 600$ (Maynard); Polymath8b reaches $246$.
5. Parity barrier (Selberg): sieve weights cannot distinguish integers with an even versus odd number of prime factors, which blocks $H=2$.`,
    refs: ['J. Maynard, "Small gaps between primes", Ann. of Math. 181 (2015)', 'D. H. J. Polymath, "Variants of the Selberg sieve, and bounded intervals containing many primes", Res. Math. Sci. 1 (2014)', 'J. Friedlander, H. Iwaniec, *Opera de Cribro*, AMS Colloquium Publ. 57 (2010)']
  },
  {
    id: 'p-iot', cat: 'postdoc', domain: 'pqc', difficulty: 4,
    title: 'Assessing a bespoke Ring-LWE proposal',
    statement: R`An industry partner proposes a Ring-LWE key exchange for constrained IoT devices with $n=1024$, $q=12289$, **binary** secrets $s\in\{0,1\}^n$ and Gaussian errors of width $\sigma=2.8$, without a CCA transform. As the postdoc on the joint project, write the assessment you would present: what is fine, what is risky, and what you would recommend instead.`,
    outline: R`1. $q=12289\equiv 1\pmod{2048}$ is NTT-friendly for $x^{1024}+1$ (as in NewHope); $n=1024$ gives ample margin against the primal and dual attacks for Gaussian secrets.
2. Binary secrets lower entropy and the norm of the secret: use the lattice estimator with the hybrid (meet-in-the-middle plus lattice) attack and rescaling for small secrets; the margin shrinks noticeably.
3. Without a CCA transform, key reuse enables key-mismatch and decryption-failure oracle attacks; require ephemeral keys or the Fujisaki–Okamoto transform with implicit rejection.
4. Implementation: constant-time NTT and Gaussian sampling (sampling is a known side-channel source; centered binomial noise is simpler).
5. Recommendation: adopt ML-KEM-768 (FIPS 203), standardized, analyzed and with vetted implementations, unless a measured constraint rules it out.`,
    refs: ['E. Alkim, L. Ducas, T. Pöppelmann, P. Schwabe, "Post-quantum key exchange — a new hope", USENIX Security 2016', 'M. R. Albrecht, R. Player, S. Scott, "On the concrete hardness of Learning with Errors", J. Math. Cryptol. 9 (2015)', 'NIST FIPS 203, *Module-Lattice-Based Key-Encapsulation Mechanism Standard* (2024)']
  },
  {
    id: 'p-units', cat: 'postdoc', domain: 'algnt', difficulty: 3,
    title: "Teaching scenario: Dirichlet's unit theorem in 50 minutes",
    statement: R`For a teaching-focused postdoc interview, design a 50-minute first-year graduate lecture proving $\mathcal{O}_K^\times\cong\mu_K\times\mathbb{Z}^{r_1+r_2-1}$. Give the lecture plan, the one example you would compute live, and the most common student misconception you would address.`,
    outline: R`1. **(5 min) Motivation:** Pell's equation $x^2-dy^2=1$ and units of $\mathbb{Z}[\sqrt d]$.
2. **(10 min) Log embedding** $\ell:\mathcal{O}_K^\times\to\mathbb{R}^{r_1+r_2}$, $u\mapsto(\log|\sigma_1u|,\dots,2\log|\tau_1u|,\dots)$; image lies in $H=\{\sum x_i=0\}$ by $N(u)=\pm1$.
3. **(10 min) Discreteness and kernel:** bounded log coordinates bound the coefficients of the characteristic polynomial, so finitely many units lie in any bounded set; the kernel is $\mu_K$.
4. **(15 min) Full rank:** for each place $v_0$, Minkowski gives $\alpha\in\mathcal{O}_K$ with $|\sigma_v(\alpha)|<1$ for $v\neq v_0$ and bounded norm; finitely many principal ideals of bounded norm produce a unit $u$ with $\ell_v(u)<0$ for $v\neq v_0$; such vectors span $H$.
5. **(7 min) Live example:** $K=\mathbb{Q}(\sqrt[3]{2})$: $r_1=1,r_2=1$, rank $1$, fundamental unit $\varepsilon=\sqrt[3]{2}-1$ (inverse $1+\sqrt[3]2+\sqrt[3]4$).
6. **(3 min) Misconception:** "rank = number of real embeddings"; stress $r_1+r_2-1$ and the role of the norm-one hyperplane.`,
    refs: ['J. Neukirch, *Algebraic Number Theory*, §I.7', 'D. A. Marcus, *Number Fields*, Ch. 5']
  },

  /* ------------------------------------------------ Simulated job postings */
  {
    id: 'j-lattice', cat: 'jobs', domain: 'pqc', difficulty: 4,
    title: 'Postdoctoral Fellow — Lattice Cryptanalysis (simulated posting)',
    org: 'Research university, Western Europe · 2-year position · deadline 2026-12-01 (simulated)',
    statement: R`**Role.** Join a group studying concrete security of module-lattice schemes (ML-KEM, ML-DSA). Work includes refining dual and hybrid attack models, sieving experiments in G6K, and the algebraic structure of $R_q=\mathbb{Z}_q[x]/(x^{256}+1)$.

**Requirements.** PhD in mathematics, computer science or related; publications on lattice reduction, LWE or algebraic number theory; programming experience (C++/Python, SageMath).

**Desirable.** Experience with $2^{0.292\beta}$-type cost modelling, GPU sieving, or formal verification of cryptographic code.`,
    outline: R`**Application strategy**
1. Research statement: one concrete open question, e.g. a rigorous analysis of dual attacks after Ducas–Pulles, and the first experiment you would run.
2. Show tooling: a reproducible lattice-estimator or G6K experiment on GitHub.
3. Connect your thesis to $\mathsf{M\text{-}LWE}$: e.g. ideal/module lattices, canonical embeddings, or Gaussian sampling.
4. Letters: one from a cryptanalyst, one from your advisor addressing independence.`,
    refs: ['L. Ducas, L. Pulles, "Does the dual-sieve attack on learning with errors even work?", CRYPTO 2023', 'M. R. Albrecht et al., "The general sieve kernel and new records in lattice reduction", EUROCRYPT 2019']
  },
  {
    id: 'j-tenure', cat: 'jobs', domain: 'ant', difficulty: 5,
    title: 'Tenure-Track Assistant Professor — Number Theory (simulated posting)',
    org: 'Research-intensive (R1) university, United States · start Fall 2027 · review from 2026-11-15 (simulated)',
    statement: R`**Role.** Tenure-track position in number theory, broadly construed: analytic number theory, automorphic forms, arithmetic geometry, or computational number theory. Teaching load 2+1 with graduate topics courses.

**Requirements.** PhD and postdoctoral experience; a research program with publications in leading journals; evidence of effective teaching and mentoring.

**Materials.** CV, research statement, teaching statement, diversity/community statement, four letters (one addressing teaching).`,
    outline: R`**Application strategy**
1. Research statement: a three-tier program (flagship result, two medium-term projects, one long-shot) with explicit statements, e.g. density estimates $N(\sigma,T)\ll T^{A(1-\sigma)+\varepsilon}$ with a target $A$.
2. Teaching statement: one concrete course design (e.g. analytic number theory with computational labs in SageMath).
3. Tailor to the department: name likely collaborators and seminars.
4. Prepare a 50-minute job talk and a 20-minute version; rehearse the first 10 minutes for a general audience.`,
    refs: ['AMS, *Employment Information in the Mathematical Sciences* (EIMS), guidance on application materials', 'MathJobs.org application conventions']
  },
  {
    id: 'j-industry', cat: 'jobs', domain: 'crypto', difficulty: 3,
    title: 'Research Scientist — Post-Quantum Migration (simulated posting)',
    org: 'Industrial research lab, hybrid · permanent · rolling deadline (simulated)',
    statement: R`**Role.** Lead the cryptographic analysis for migrating TLS and code-signing infrastructure from RSA/ECDSA to ML-KEM, ML-DSA and SLH-DSA, including hybrid key exchange (e.g. X25519 combined with ML-KEM-768) and certificate size budgets.

**Requirements.** PhD in cryptography or number theory; strong understanding of security reductions (FO transform, QROM); experience reading standards (FIPS 203/204/205, IETF drafts).

**Desirable.** Side-channel evaluation, constant-time engineering, or protocol formal analysis (Tamarin, ProVerif).`,
    outline: R`**Application strategy**
1. Emphasize translation skills: explain one proof, e.g. IND-CCA of the FO transform with implicit rejection, in one page for engineers.
2. Show a migration artifact: a threat model with "harvest now, decrypt later" timelines and NIST IR 8547 deprecation dates.
3. Prepare for a technical interview on ECDSA nonce bias (hidden number problem) and on ML-KEM decryption failures.`,
    refs: ['NIST FIPS 203, 204, 205 (August 2024)', 'NIST IR 8547 (initial public draft), *Transition to Post-Quantum Cryptography Standards* (2024)']
  }
];
