/*
 * Ported verbatim from the reviewed desktop dashboard (app/index.html, PR #1).
 * Strings use String.raw so LaTeX backslashes survive; Markdown code fences
 * inside template literals use "~~~" because backticks would end the literal.
 */
import type { Domain } from './types';

const R = String.raw;

export const DOMAINS: Domain[] = [
  /* ---------------------------------------------------------------- 1 */
  {
    id: 'cnt',
    name: 'Computational Number Theory',
    short: 'Computational NT',
    glyph: 'ℙ',
    color: '#90CDF4',
    tint: 'rgba(26,54,93,.55)',
    topic: 'factoring',
    summary: R`Algorithms whose correctness is a theorem and whose running time is a research question: primality proving (AKS, ECPP), integer factorization (ECM, QS, GNFS), point counting on elliptic curves and discrete-logarithm computation. Costs are measured with $L_N[\alpha,c]=\exp\!\big((c+o(1))(\log N)^{\alpha}(\log\log N)^{1-\alpha}\big)$.`,
    topics: [
      { title: 'Deterministic primality: AKS',
        md: R`**Theorem (Agrawal–Kayal–Saxena, 2002).** Let $n>1$ not be a perfect power and let $r$ satisfy $\operatorname{ord}_r(n) > \log_2^2 n$. If $n$ has no prime factor $\le r$ and
$$(X+a)^n \equiv X^n + a \pmod{n,\; X^r-1}\quad\text{for all } 1\le a\le \big\lfloor \sqrt{\varphi(r)}\,\log_2 n\big\rfloor,$$
then $n$ is prime. The published analysis (Annals, 2004) of this version gives $\widetilde O(\log^{21/2} n)$ (the 2002 preprint, with a different choice of $r$, gave $\widetilde O(\log^{12} n)$); the Lenstra–Pomerance variant with Gaussian periods runs in $\widetilde O(\log^{6} n)$.` },
      { title: 'Elliptic curve primality proving (ECPP)',
        md: R`**Proposition (Goldwasser–Kilian).** Let $\gcd(N,6)=1$ and $E:y^2=x^3+ax+b$ over $\mathbb{Z}/N\mathbb{Z}$ with $\gcd(4a^3+27b^2,N)=1$. Let $q\mid m$ with $q>(N^{1/4}+1)^2$ prime. If $P\in E(\mathbb{Z}/N\mathbb{Z})$ satisfies $mP=\mathcal{O}$ while $(m/q)P$ is defined and $\neq\mathcal{O}$, then $N$ is prime.

*Proof idea.* A prime $p\mid N$ with $p\le\sqrt N$ would give a point of order divisible by $q$ in $E(\mathbb{F}_p)$, forcing $q\le p+1+2\sqrt p=(\sqrt p+1)^2\le (N^{1/4}+1)^2$. Atkin–Morain pick $E$ with complex multiplication so that $m=\#E$ is known; fastECPP is heuristically $\widetilde O(\log^4 N)$.` },
      { title: 'General Number Field Sieve',
        md: R`Choose $f\in\mathbb{Z}[x]$ of degree $d$ and $m$ with $f(m)\equiv 0\pmod N$; let $\alpha$ be a root of $f$ and $\phi:\mathbb{Z}[\alpha]\to\mathbb{Z}/N\mathbb{Z}$, $\alpha\mapsto m$. A set $S$ of coprime pairs with
$$\prod_{(a,b)\in S}(a-b\alpha)=\gamma^2\in\mathbb{Z}[\alpha],\qquad \prod_{(a,b)\in S}(a-bm)=y^2\in\mathbb{Z}$$
(up to the usual $f'(\alpha)^2$ correction) yields $\phi(\gamma)^2\equiv y^2\pmod N$. Relations come from pairs where $a-bm$ and $b^d f(a/b)$ are both $B$-smooth; dependencies are found over $\mathbb{F}_2$ by block Wiedemann. Heuristic cost: $L_N\!\left[\tfrac13,\left(\tfrac{64}{9}\right)^{1/3}\right]$.` },
      { title: 'Point counting: Schoof and SEA',
        md: R`The $p$-power Frobenius $\pi$ satisfies $\pi^2-[t]\pi+[p]=0$ in $\operatorname{End}(E)$. Schoof's algorithm determines $t\bmod\ell$ for small primes $\ell$ by testing this identity on $E[\ell]$ modulo the division polynomial $\psi_\ell$, then recovers $t$ by the CRT once $\prod\ell>4\sqrt p$. Cost $O(\log^8 p)$ with schoolbook arithmetic; the Schoof–Elkies–Atkin refinement, using Elkies primes where $\pi$ has an eigenvalue in $\mathbb{F}_\ell$, is heuristically $\widetilde O(\log^4 p)$.` },
      { title: 'Discrete logarithms',
        md: R`In a cyclic group of prime order $n$, Pollard's $\rho$ computes $\log_g h$ with about $\sqrt{\pi n/2}$ group operations, which is optimal for generic algorithms (Shoup: $\Omega(\sqrt n)$). In $\mathbb{F}_p^\times$ the number field sieve reaches $L_p[1/3,(64/9)^{1/3}]$, and in small characteristic $\mathbb{F}_{2^n}$ quasi-polynomial algorithms exist (Barbulescu–Gaudry–Joux–Thomé, 2014).` }
    ],
    cheat: [
      { label: 'Subexponential L-notation', tex: R`L_N[\alpha,c]=\exp\!\Big((c+o(1))\,(\log N)^{\alpha}(\log\log N)^{1-\alpha}\Big)` },
      { label: 'GNFS heuristic running time', tex: R`T_{\mathrm{GNFS}}(N)=L_N\!\left[\tfrac13,\ \sqrt[3]{64/9}\,\right]\approx L_N\!\left[\tfrac13,\ 1.923\right]` },
      { label: 'AKS congruence', tex: R`(X+a)^n\equiv X^n+a \pmod{n,\ X^r-1},\qquad 1\le a\le\big\lfloor\sqrt{\varphi(r)}\log_2 n\big\rfloor` },
      { label: 'Miller–Rabin strong probable prime', tex: R`n-1=2^s d,\ d \text{ odd}:\quad a^{d}\equiv 1\ \ \text{or}\ \ a^{2^r d}\equiv -1 \pmod n\ \text{for some } 0\le r<s;\qquad \Pr[\text{error}]\le 4^{-k}` },
      { label: 'Frobenius characteristic equation', tex: R`\pi_E^2-[t]\,\pi_E+[p]=0 \ \text{in}\ \operatorname{End}(E),\qquad t=p+1-\#E(\mathbb{F}_p)` },
      { label: "Hasse's theorem", tex: R`\#E(\mathbb{F}_p)=p+1-t,\qquad |t|\le 2\sqrt{p}` },
      { label: 'Dickman–de Bruijn smoothness', tex: R`\Psi\big(x,x^{1/u}\big)=\rho(u)\,x\,(1+o(1)),\qquad \rho(u)=u^{-u(1+o(1))}` },
      { label: "Pollard's rho expected cost", tex: R`\mathbb{E}[\#\text{steps}]\sim\sqrt{\pi n/2}` },
      { label: 'Goldwasser–Kilian prime bound', tex: R`q\ \big|\ \#E(\mathbb{F}_p)\ \Longrightarrow\ q\le\big(\sqrt{p}+1\big)^2` }
    ],
    questions: [
      { title: 'Classical polynomial-time factoring', status: 'Open problem',
        md: R`Is there a classical algorithm factoring $N$ in time $(\log N)^{O(1)}$? The best heuristic bound is $L_N[1/3,1.923]$ (GNFS); the best *rigorous* bound is $L_N[1/2,1+o(1)]$ (Lenstra–Pomerance, 1992). Shor's algorithm factors in quantum polynomial time.` },
      { title: 'Primality in $\widetilde O(\log^3 n)$', status: 'Open problem',
        md: R`Can deterministic primality proving run in $\widetilde O(\log^{3} n)$? A conjecture of Agrawal on the congruence $(X-1)^n\equiv X^n-1 \pmod{n,X^r-1}$ would give this, but Lenstra and Pomerance gave a heuristic argument that the conjecture fails as stated.` },
      { title: 'Rigorous analysis of the number field sieve', status: 'Active research',
        md: R`The $L_N[1/3]$ bound assumes that values $b^d f(a/b)$ and $a-bm$ are smooth with the same probability as random integers of their size. Proving a rigorous $L_N[1/3+o(1)]$ bound for any factoring algorithm remains open.` },
      { title: 'Subexponential ECDLP over prime fields', status: 'Open problem',
        md: R`Is there an $L_p[\alpha]$ algorithm with $\alpha<1$ for the discrete logarithm on $E(\mathbb{F}_p)$? Summation-polynomial index calculus (Semaev) gives subexponential heuristics over some extension fields $\mathbb{F}_{q^n}$, but nothing better than $O(\sqrt p)$ is known for prime fields.` }
    ]
  },

  /* ---------------------------------------------------------------- 2 */
  {
    id: 'crypto',
    name: 'Cryptography',
    short: 'Cryptography',
    glyph: '⊕',
    color: '#FBD38D',
    tint: 'rgba(123,52,30,.45)',
    topic: 'elliptic',
    summary: R`Classical public-key cryptography rests on two problems: factoring ($\mathrm{RSA}$) and discrete logarithms in $\mathbb{F}_p^\times$ or $E(\mathbb{F}_p)$ (Diffie–Hellman, ECDSA). Bilinear pairings $e:\mathbb{G}_1\times\mathbb{G}_2\to\mathbb{G}_T$ enable short signatures and identity-based encryption, and Shor's algorithm breaks all of them on a large quantum computer.`,
    topics: [
      { title: 'RSA and its correctness',
        md: R`Let $N=pq$, $\lambda(N)=\operatorname{lcm}(p-1,q-1)$ and $ed\equiv 1\pmod{\lambda(N)}$. For **every** $m\in\mathbb{Z}/N\mathbb{Z}$, including $\gcd(m,N)>1$, the CRT and Fermat give $m^{ed}\equiv m\pmod N$. Recovering $d$ from $(N,e)$ is deterministically polynomial-time equivalent to factoring (Coron–May, 2007); whether *inverting* RSA is equivalent to factoring is open.` },
      { title: 'Diffie–Hellman and the DLP hierarchy',
        md: R`In $\mathbb{G}=\langle g\rangle$ of order $n$: $\mathrm{DLP}\Rightarrow\mathrm{CDH}\Rightarrow\mathrm{DDH}$ (each solver yields the next). **Pohlig–Hellman** reduces the DLP to prime-order subgroups: for $n=\prod p_i^{e_i}$ the cost is $O\big(\sum_i e_i(\log n+\sqrt{p_i})\big)$, so $n$ must have a large prime factor. DDH is easy in $\mathbb{G}$ when an efficiently computable symmetric pairing $e:\mathbb{G}\times\mathbb{G}\to\mathbb{G}_T$ exists (e.g. via a distortion map); for asymmetric Type-3 pairings DDH is still assumed hard in $\mathbb{G}_1$ and $\mathbb{G}_2$ (SXDH).` },
      { title: 'Elliptic curve cryptography',
        md: R`For $E:y^2=x^3+ax+b$ over $\mathbb{F}_p$, the chord–tangent law makes $E(\mathbb{F}_p)$ an abelian group of order $p+1-t$, $|t|\le 2\sqrt p$. ECDSA signs with $r=(kG)_x\bmod n$, $s=k^{-1}(H(m)+rd)\bmod n$. Reusing $k$ on two messages leaks the key: $k=(H_1-H_2)(s_1-s_2)^{-1}$ and $d=(sk-H(m))\,r^{-1}\bmod n$; even a few biased nonce bits break ECDSA via the hidden number problem.` },
      { title: 'Bilinear pairings',
        md: R`A pairing is a map $e:\mathbb{G}_1\times\mathbb{G}_2\to\mathbb{G}_T$ with $e(aP,bQ)=e(P,Q)^{ab}$, non-degenerate and efficiently computable (Weil/Tate pairing via Miller's algorithm). **BLS signatures:** $\sigma=x\,H(m)$, verified by $e(\sigma,g_2)=e(H(m),x g_2)$. The MOV/Frey–Rück reduction maps the ECDLP to $\mathbb{F}_{p^k}^\times$, $k$ the embedding degree, so pairing-friendly curves balance $k$ against NFS variants such as exTNFS.` },
      { title: "Shor's algorithm and the quantum threat",
        md: R`Order finding for $f(x)=a^x \bmod N$ is a hidden subgroup problem in $\mathbb{Z}$, solved by the quantum Fourier transform in polynomial time. With even period $r$ and $a^{r/2}\not\equiv -1$, $\gcd(a^{r/2}\pm 1,N)$ splits $N$. The same technique solves discrete logarithms in any abelian group, including $E(\mathbb{F}_p)$; this is why NIST is standardizing post-quantum replacements.` }
    ],
    cheat: [
      { label: 'RSA', tex: R`c\equiv m^{e}\pmod N,\quad m\equiv c^{d}\pmod N,\quad ed\equiv 1 \pmod{\lambda(N)},\ \ \lambda(N)=\operatorname{lcm}(p-1,q-1)` },
      { label: 'Diffie–Hellman', tex: R`K=g^{ab}=\big(g^{a}\big)^{b}=\big(g^{b}\big)^{a}` },
      { label: 'Pohlig–Hellman cost', tex: R`n=\prod_{i} p_i^{e_i}\ \Longrightarrow\ O\Big(\sum_{i} e_i\big(\log n+\sqrt{p_i}\big)\Big)` },
      { label: 'Weierstrass curve over F_p', tex: R`E:\ y^2=x^3+ax+b \ \text{ over } \mathbb{F}_p,\qquad 4a^3+27b^2\neq 0` },
      { label: 'Chord–tangent addition', tex: R`\lambda=\frac{y_2-y_1}{x_2-x_1},\quad x_3=\lambda^2-x_1-x_2,\quad y_3=\lambda(x_1-x_3)-y_1` },
      { label: 'ECDSA', tex: R`r=(kG)_x \bmod n,\qquad s=k^{-1}\big(H(m)+r\,d\big)\bmod n` },
      { label: 'Pairing bilinearity', tex: R`e(aP,bQ)=e(P,Q)^{ab},\qquad e:\mathbb{G}_1\times\mathbb{G}_2\to\mathbb{G}_T` },
      { label: 'BLS verification', tex: R`e(\sigma,\,g_2)\overset{?}{=}e\big(H(m),\,\mathrm{pk}\big),\qquad \sigma=x\,H(m),\ \mathrm{pk}=x\,g_2` },
      { label: "Wiener's bound", tex: R`q<p<2q,\ ed-k\varphi(N)=1,\ d<\tfrac13 N^{1/4}\ \Longrightarrow\ \tfrac{k}{d}\ \text{is a convergent of}\ \tfrac{e}{N}` },
      { label: "Coppersmith's theorem", tex: R`f \text{ monic},\ \deg f=\delta:\ \text{all } |x_0|<N^{1/\delta}\ \text{with}\ f(x_0)\equiv 0 \!\!\pmod N \text{ in poly time}` },
      { label: "Shor's post-processing", tex: R`r=\operatorname{ord}_N(a)\ \text{even},\ a^{r/2}\not\equiv -1 \!\!\pmod N\ \Longrightarrow\ 1<\gcd\big(a^{r/2}-1,N\big)<N` }
    ],
    questions: [
      { title: 'Is breaking RSA equivalent to factoring?', status: 'Open problem',
        md: R`Computing $d$ is equivalent to factoring, but computing $e$-th roots modulo $N$ might be easier. Boneh–Venkatesan (1998) showed that an algebraic reduction for small $e$ would itself yield a factoring algorithm; Aggarwal–Maurer (2009) proved equivalence for generic ring algorithms.` },
      { title: 'CDH versus DLP in general groups', status: 'Open problem',
        md: R`den Boer (1988) proved $\mathrm{CDH}\Leftrightarrow\mathrm{DLP}$ in $\mathbb{G}$ of prime order $q$ when $q-1$ is smooth; Maurer and Maurer–Wolf extended this to any $q$ for which an auxiliary elliptic curve over $\mathbb{F}_q$ with smooth order is available. An unconditional, efficient reduction for every group family is unknown.` },
      { title: 'Cryptographic multilinear maps', status: 'Active research',
        md: R`Do $n$-linear maps $e:\mathbb{G}_1^{n}\to\mathbb{G}_T$ with $n\ge 3$ exist under standard assumptions? Candidate graded encodings (GGH13, CLT13) suffered zeroizing attacks. Indistinguishability obfuscation is now known from well-founded assumptions (Jain–Lin–Sahai, 2021) without them, but the existence question is open.` },
      { title: 'Standard-model security of ECDSA', status: 'Open problem',
        md: R`Known proofs of EUF-CMA security for ECDSA use the generic group model (Brown) or idealize the conversion function $(kG)\mapsto r$ (Fersch–Kiltz–Poettering). A proof from the ECDLP in the random oracle model alone is open.` }
    ]
  },

  /* ---------------------------------------------------------------- 3 */
  {
    id: 'pqc',
    name: 'Post-Quantum Cryptography',
    short: 'Post-Quantum',
    glyph: 'Λ',
    color: '#9AE6B4',
    tint: 'rgba(47,133,90,.40)',
    topic: 'lattice',
    summary: R`Public-key cryptography from problems believed hard for quantum computers: lattices (LWE, Ring-LWE, Module-LWE, NTRU), codes, hash functions and isogenies. NIST published FIPS 203 (ML-KEM, from CRYSTALS-Kyber), FIPS 204 (ML-DSA) and FIPS 205 (SLH-DSA) in August 2024. Security rests on worst-case to average-case reductions such as $\mathsf{GapSVP}_\gamma\le\mathsf{LWE}_{n,q,\chi}$.`,
    topics: [
      { title: 'Learning With Errors',
        md: R`**Theorem (Regev, 2005).** Let $q\le 2^{\mathrm{poly}(n)}$ and $\alpha\in(0,1)$ with $\alpha q\ge 2\sqrt n$. Solving $\mathsf{LWE}_{n,q,\chi}$ for $\chi=D_{\mathbb{Z},\alpha q}$ is at least as hard as **quantumly** solving $\mathsf{GapSVP}_\gamma$ and $\mathsf{SIVP}_\gamma$ in the worst case for $\gamma=\widetilde O(n/\alpha)$:
$$\mathsf{LWE}_{n,q,\chi}:\ \text{distinguish } (\mathbf{A},\mathbf{A}\mathbf{s}+\mathbf{e}) \text{ from } (\mathbf{A},\mathbf{u}),\quad \mathbf{A}\leftarrow\mathbb{Z}_q^{m\times n},\ \mathbf{e}\leftarrow\chi^m.$$
Peikert (2009) gave a classical reduction from $\mathsf{GapSVP}$ for $q\ge 2^{n/2}$.` },
      { title: 'Ring-LWE and Module-LWE',
        md: R`With $R=\mathbb{Z}[x]/(x^n+1)$, $n=2^k$ (the ring of integers of $\mathbb{Q}(\zeta_{2n})$) and $R_q=R/qR$, Ring-LWE samples are $(a,\ a\cdot s+e)\in R_q^2$. Lyubashevsky–Peikert–Regev (2010) reduce worst-case approximate SVP on **ideal lattices** to search Ring-LWE (quantumly), and search to decision when $q$ splits. Module-LWE works over $R_q^{k}$ and interpolates between LWE ($n=1$) and Ring-LWE ($k=1$); Langlois–Stehlé proved worst-case hardness over module lattices.` },
      { title: 'ML-KEM (CRYSTALS-Kyber)',
        md: R`Parameters: $n=256$, $q=3329$, rank $k\in\{2,3,4\}$ (ML-KEM-512/768/1024). With $\mathbf{A}\in R_q^{k\times k}$ and small $\mathbf{s},\mathbf{e},\mathbf{r},\mathbf{e}_1,e_2$ from a centered binomial distribution:
$$\mathbf{t}=\mathbf{A}\mathbf{s}+\mathbf{e},\qquad \mathbf{u}=\mathbf{A}^{\mathsf T}\mathbf{r}+\mathbf{e}_1,\qquad v=\mathbf{t}^{\mathsf T}\mathbf{r}+e_2+\left\lceil \tfrac q2\right\rfloor m.$$
Decryption computes $v-\mathbf{s}^{\mathsf T}\mathbf{u}=\lceil q/2\rfloor m+(\mathbf{e}^{\mathsf T}\mathbf{r}-\mathbf{s}^{\mathsf T}\mathbf{e}_1+e_2)$. A Fujisaki–Okamoto transform with implicit rejection lifts the CPA scheme to IND-CCA2. Standardized as FIPS 203 (2024).` },
      { title: 'NTRU',
        md: R`Choose small $f,g\in R=\mathbb{Z}[x]/(x^n-1)$ with $f$ invertible mod $p$ and mod $q$; the public key is $h\equiv p\,g\,f^{-1}\pmod q$. The NTRU lattice
$$\Lambda_h=\left\{(\mathbf{u},\mathbf{v})\in\mathbb{Z}^{2n}:\ \mathbf{v}\equiv h\star\mathbf{u}\ (\mathrm{mod}\ q)\right\}$$
contains the unusually short vector $(f,pg)$. For large moduli ("overstretched" NTRU), subfield and dense-sublattice attacks (Albrecht–Bai–Ducas 2016; Kirchner–Fouque 2017) are far stronger than generic reduction.` },
      { title: 'Isogeny-based cryptography',
        md: R`SIDH/SIKE was broken in polynomial time in 2022 (Castryck–Decru; Maino–Martindale; Robert) using Kani's reducibility criterion for $(N,N)$-isogenies of products of elliptic curves (for $N=2^a$, computed in dimension $2$ as chains of $(2,2)$-isogenies), exploiting revealed torsion images. Surviving designs avoid torsion leakage: **CSIDH** uses the free, transitive action of $\operatorname{Cl}(\mathbb{Z}[\sqrt{-p}])$ on the $\mathbb{F}_p$-isomorphism classes of supersingular curves over $\mathbb{F}_p$ with $\operatorname{End}_{\mathbb{F}_p}(E)\cong\mathbb{Z}[\sqrt{-p}]$, and **SQIsign** uses the Deuring correspondence between supersingular curves and maximal orders in $B_{p,\infty}$.` },
      { title: 'Lattice reduction and concrete security',
        md: R`BKZ-$\beta$ achieves root Hermite factor $\delta_\beta\approx\big(\tfrac{\beta}{2\pi e}(\pi\beta)^{1/\beta}\big)^{1/(2(\beta-1))}$, so $\lVert\mathbf b_1\rVert\approx\delta_\beta^{\,d}\det(\Lambda)^{1/d}$. The core-SVP methodology charges $2^{0.292\beta}$ classically (Becker–Ducas–Gama–Laarhoven sieving) and $2^{0.265\beta}$ quantumly (Laarhoven). The primal uSVP attack succeeds roughly when $\sqrt{\beta}\,\sigma\le\delta_\beta^{\,2\beta-d}\det(\Lambda)^{1/d}$.` }
    ],
    cheat: [
      { label: 'LWE decision problem', tex: R`\text{LWE}_{n,q,\chi}:\ \text{distinguish}\ (\mathbf{A},\mathbf{A}\mathbf{s}+\mathbf{e})\ \text{from}\ (\mathbf{A},\mathbf{u}),\ \ \mathbf{A}\in\mathbb{Z}_q^{m\times n},\ \mathbf{e}\leftarrow\chi^{m}` },
      { label: 'Ring-LWE sample', tex: R`R_q=\mathbb{Z}_q[x]/(x^{n}+1),\qquad (a,\ b=a\cdot s+e)\in R_q\times R_q` },
      { label: 'ML-KEM encryption', tex: R`\mathbf{u}=\mathbf{A}^{\mathsf T}\mathbf{r}+\mathbf{e}_1,\qquad v=\mathbf{t}^{\mathsf T}\mathbf{r}+e_2+\left\lceil\tfrac{q}{2}\right\rfloor m` },
      { label: 'ML-KEM decryption noise', tex: R`v-\mathbf{s}^{\mathsf T}\mathbf{u}=\left\lceil\tfrac{q}{2}\right\rfloor m+\underbrace{\mathbf{e}^{\mathsf T}\mathbf{r}-\mathbf{s}^{\mathsf T}\mathbf{e}_1+e_2}_{\lVert\cdot\rVert_\infty<q/4\ \Rightarrow\ \text{correct}}` },
      { label: 'NTRU public key', tex: R`h\equiv p\,g\,f^{-1}\pmod q,\qquad (f,\,pg)\in\Lambda_h` },
      { label: 'Gaussian function', tex: R`\rho_s(\mathbf{x})=\exp\!\big(-\pi\lVert\mathbf{x}\rVert^2/s^2\big),\qquad D_{\Lambda,s}(\mathbf{x})=\frac{\rho_s(\mathbf{x})}{\rho_s(\Lambda)}` },
      { label: 'Smoothing parameter of Z^n', tex: R`\eta_\varepsilon(\mathbb{Z}^n)\le\sqrt{\frac{\ln\!\big(2n(1+1/\varepsilon)\big)}{\pi}}` },
      { label: "Minkowski's first theorem", tex: R`\lambda_1(\Lambda)\le\sqrt{n}\,\det(\Lambda)^{1/n}` },
      { label: 'Root Hermite factor of BKZ', tex: R`\delta_\beta\approx\left(\frac{\beta}{2\pi e}\,(\pi\beta)^{1/\beta}\right)^{\frac{1}{2(\beta-1)}}` },
      { label: 'Sieving cost (core-SVP)', tex: R`T_{\mathrm{SVP}}(\beta)=2^{0.292\beta+o(\beta)}\ \text{(classical)},\qquad 2^{0.265\beta+o(\beta)}\ \text{(quantum)}` },
      { label: 'CSIDH group action', tex: R`\operatorname{Cl}(\mathcal{O})\times\mathcal{E}\ell\ell_p(\mathcal{O})\to\mathcal{E}\ell\ell_p(\mathcal{O}),\qquad [\mathfrak{a}]\star E=E/E[\mathfrak{a}]` }
    ],
    questions: [
      { title: 'Is SVP on ideal lattices easier?', status: 'Active research',
        md: R`Cramer–Ducas–Peikert–Regev (2016) and Cramer–Ducas–Wesolowski (2017) give quantum polynomial-time algorithms for $\gamma$-SVP on ideal lattices in cyclotomic fields with $\gamma=2^{\widetilde O(\sqrt n)}$, better than BKZ for that factor. Whether ideal-SVP is easier for $\gamma=\mathrm{poly}(n)$, the regime relevant to Ring-LWE, is open.` },
      { title: 'Classical reductions without dimension loss', status: 'Open problem',
        md: R`Brakerski–Langlois–Peikert–Regev–Stehlé (2013) show classical hardness of LWE with $q=\mathrm{poly}(n)$, but from lattices of dimension about $\sqrt n$. Can Regev's quantum step be removed without that loss?` },
      { title: 'Does the dual-sieve attack work?', status: 'Active research',
        md: R`Dual attacks combined with lattice sieving claimed improvements against Kyber-type parameters. Ducas–Pulles (CRYPTO 2023) showed the independence heuristics behind these estimates contradict experiments. Rigorous analyses of dual attacks are still being developed.` },
      { title: 'Module rank and hardness', status: 'Open problem',
        md: R`Is $\mathsf{M\text{-}LWE}$ over $R_q^{k}$ with $k\ge 2$ strictly harder than Ring-LWE in the same total dimension $nk$? Reductions exist between ranks with parameter loss, but no separation or tight equivalence is known.` },
      { title: 'Quantum security of CSIDH', status: 'Active research',
        md: R`Key recovery for CSIDH is an abelian hidden shift problem, solvable with Kuperberg-type algorithms in $2^{O(\sqrt{\log N})}$ queries for $N=\#\operatorname{Cl}(\mathcal{O})$. Concrete estimates (Peikert 2020; Bonnetain–Schrottenloher 2020) suggest CSIDH-512 misses NIST level 1; the parameters that reach each level are still debated.` }
    ]
  },

  /* ---------------------------------------------------------------- 4 */
  {
    id: 'ant',
    name: 'Analytic Number Theory',
    short: 'Analytic NT',
    glyph: 'ζ',
    color: '#D6BCFA',
    tint: 'rgba(68,51,122,.45)',
    topic: 'zeta',
    summary: R`The distribution of primes through complex analysis: $\zeta(s)$ and $L$-functions, their zeros and the explicit formula, sieve methods, and modular forms. Prototype identity (Euler, 1737):
$$\zeta(s)=\sum_{n=1}^{\infty}\frac{1}{n^{s}}=\prod_{p\ \text{prime}}\frac{1}{1-p^{-s}},\qquad \Re(s)>1.$$`,
    topics: [
      { title: 'Zeta functions',
        md: R`$\zeta(s)$ continues meromorphically to $\mathbb{C}$ with a simple pole at $s=1$. The completed function $\xi(s)=\tfrac12 s(s-1)\pi^{-s/2}\Gamma(s/2)\zeta(s)$ is entire and satisfies $\xi(s)=\xi(1-s)$. The nontrivial zeros $\rho=\beta+i\gamma$ lie in $0<\beta<1$, and
$$N(T)=\#\{\rho: 0<\gamma\le T\}=\frac{T}{2\pi}\log\frac{T}{2\pi e}+O(\log T).$$` },
      { title: 'Prime distribution formulas',
        md: R`For $x>1$ not a prime power, the **explicit formula** reads
$$\psi(x)=\sum_{n\le x}\Lambda(n)=x-\sum_{\rho}\frac{x^{\rho}}{\rho}-\log 2\pi-\tfrac12\log\!\big(1-x^{-2}\big).$$
The de la Vallée Poussin zero-free region $\sigma>1-c/\log(|t|+2)$ gives $\pi(x)=\operatorname{Li}(x)+O\big(x e^{-c\sqrt{\log x}}\big)$; RH is equivalent to $\pi(x)=\operatorname{Li}(x)+O(\sqrt x\log x)$.` },
      { title: 'L-functions and primes in progressions',
        md: R`For a Dirichlet character $\chi \bmod q$,
$$L(s,\chi)=\sum_{n=1}^{\infty}\frac{\chi(n)}{n^{s}}=\prod_{p}\big(1-\chi(p)p^{-s}\big)^{-1}.$$
Orthogonality and $L(1,\chi)\neq 0$ give Dirichlet's theorem. **Siegel–Walfisz:** for $q\le(\log x)^A$ and $(a,q)=1$, $\psi(x;q,a)=\frac{x}{\varphi(q)}+O_A\big(x e^{-c\sqrt{\log x}}\big)$, with an ineffective constant because of possible Siegel zeros.` },
      { title: 'Sieve methods',
        md: R`Selberg's $\Lambda^2$ sieve minimizes the quadratic form $\sum_{n\in\mathcal{A}}\big(\sum_{d\mid (n,P(z))}\lambda_d\big)^2$ with $\lambda_1=1$, giving the Brun–Titchmarsh inequality $\pi(x;q,a)\le\frac{(2+o(1))\,x}{\varphi(q)\log(x/q)}$; the sharp form with constant exactly $2$ for all $q<x$ is due to Montgomery–Vaughan (1973) via the large sieve. The **large sieve** and **Bombieri–Vinogradov** (GRH "on average" for $q\le x^{1/2-\varepsilon}$) drive the Goldston–Pintz–Yıldırım and Maynard–Tao bounded-gaps theorems.` },
      { title: 'Modular forms basics',
        md: R`A modular form of weight $k$ for $\mathrm{SL}_2(\mathbb{Z})$ is holomorphic on $\mathbb{H}$, satisfies $f\big(\tfrac{az+b}{cz+d}\big)=(cz+d)^k f(z)$ and is holomorphic at $\infty$: $f(z)=\sum_{n\ge0}a_n q^n$, $q=e^{2\pi i z}$. The discriminant $\Delta(z)=q\prod_{n\ge1}(1-q^n)^{24}=\sum\tau(n)q^n$ is a Hecke eigenform; Deligne proved $|\tau(p)|\le 2p^{11/2}$. For level 1 eigenforms, $\Lambda(f,s)=(2\pi)^{-s}\Gamma(s)L(f,s)$ satisfies $\Lambda(f,k-s)=(-1)^{k/2}\Lambda(f,s)$.` }
    ],
    cheat: [
      { label: 'Euler product', tex: R`\zeta(s)=\sum_{n=1}^{\infty}\frac{1}{n^{s}}=\prod_{p\ \text{prime}}\frac{1}{1-p^{-s}},\qquad \Re(s)>1` },
      { label: 'Functional equation', tex: R`\xi(s)=\tfrac12 s(s-1)\,\pi^{-s/2}\,\Gamma\!\left(\tfrac s2\right)\zeta(s),\qquad \xi(s)=\xi(1-s)` },
      { label: 'Explicit formula', tex: R`\psi(x)=x-\sum_{\rho}\frac{x^{\rho}}{\rho}-\log 2\pi-\tfrac12\log\!\left(1-x^{-2}\right)` },
      { label: 'Prime number theorem with error', tex: R`\pi(x)=\operatorname{Li}(x)+O\!\left(x\,e^{-c\sqrt{\log x}}\right),\qquad \operatorname{Li}(x)=\int_2^{x}\frac{dt}{\log t}` },
      { label: 'Dirichlet L-function', tex: R`L(s,\chi)=\sum_{n=1}^{\infty}\frac{\chi(n)}{n^{s}}=\prod_{p}\left(1-\frac{\chi(p)}{p^{s}}\right)^{-1}` },
      { label: 'Character orthogonality', tex: R`\frac{1}{\varphi(q)}\sum_{\chi \bmod q}\overline{\chi}(a)\chi(n)=\begin{cases}1 & n\equiv a \pmod q\\ 0 & \text{otherwise}\end{cases}\qquad (a,q)=1` },
      { label: 'Large sieve inequality', tex: R`\sum_{q\le Q}\frac{q}{\varphi(q)}\ \sum_{\chi \bmod q}^{*}\ \Big|\sum_{n\le N}a_n\chi(n)\Big|^2\le\big(N+Q^2\big)\sum_{n\le N}|a_n|^2` },
      { label: 'Bombieri–Vinogradov', tex: R`\sum_{q\le x^{1/2}(\log x)^{-B}}\ \max_{(a,q)=1}\Big|\psi(x;q,a)-\frac{x}{\varphi(q)}\Big|\ll_A\frac{x}{(\log x)^{A}},\qquad B=B(A)\ (\text{e.g. }B=A+5)` },
      { label: 'Ramanujan Δ and Deligne', tex: R`\Delta(z)=q\prod_{n\ge1}(1-q^{n})^{24}=\sum_{n\ge1}\tau(n)q^{n},\qquad |\tau(p)|\le 2p^{11/2}` },
      { label: 'Dirichlet class number formula', tex: R`L(1,\chi_d)=\frac{2\pi\,h(d)}{w_d\sqrt{|d|}}\quad (d<0),\qquad L(1,\chi_d)=\frac{2\,h(d)\log\varepsilon_d}{\sqrt d}\quad (d>0,\ \varepsilon_d>1\ \text{fundamental unit})` }
    ],
    questions: [
      { title: 'The Riemann Hypothesis', status: 'Open problem',
        md: R`Every nontrivial zero of $\zeta(s)$ satisfies $\Re(\rho)=\tfrac12$ (Riemann, 1859; a Clay Millennium Problem). Equivalent: $\psi(x)=x+O\big(\sqrt x\log^2 x\big)$. More than $10^{13}$ zeros have been verified on the critical line, and a positive proportion is known to lie on it (Selberg; Levinson; Conrey's $>2/5$).` },
      { title: 'Twin primes and the parity barrier', status: 'Conjecture',
        md: R`Are there infinitely many $p$ with $p+2$ prime? Zhang (2013) proved $\liminf(p_{n+1}-p_n)<7\cdot10^7$; Maynard–Tao and Polymath8b reduced this to $246$, and to $6$ under the generalized Elliott–Halberstam conjecture. Selberg's parity problem prevents sieve methods alone from reaching $2$.` },
      { title: 'The Lindelöf Hypothesis', status: 'Conjecture',
        md: R`$\zeta\big(\tfrac12+it\big)\ll_\varepsilon |t|^{\varepsilon}$, a consequence of RH. The best unconditional exponent is $\zeta(\tfrac12+it)\ll |t|^{13/84+\varepsilon}$ (Bourgain, 2017), from decoupling estimates for exponential sums.` },
      { title: 'Landau–Siegel zeros', status: 'Open problem',
        md: R`Can one rule out a real zero $\beta>1-\frac{c}{\log q}$ of $L(s,\chi)$ for real $\chi\bmod q$? Siegel's theorem $L(1,\chi)\gg_\varepsilon q^{-\varepsilon}$ is ineffective; making it effective would, for instance, give an effective lower bound $h(d)\gg_\varepsilon|d|^{1/2-\varepsilon}$, far beyond the effective $h(d)\gg_\varepsilon(\log|d|)^{1-\varepsilon}$ of Goldfeld–Gross–Zagier that already settles Gauss's class number problem effectively.` },
      { title: 'Zero-density estimates', status: 'Active research',
        md: R`The density hypothesis $N(\sigma,T)\ll T^{2(1-\sigma)+\varepsilon}$ is open. Guth–Maynard (2024) proved $N(\sigma,T)\ll T^{30(1-\sigma)/13+\varepsilon}$ via new large-value estimates for Dirichlet polynomials, improving Ingham's bound near $\sigma=3/4$ and giving the prime number theorem in intervals $[x,x+x^{17/30+\varepsilon}]$.` }
    ]
  },

  /* ---------------------------------------------------------------- 5 */
  {
    id: 'algnt',
    name: 'Algebraic Number Theory',
    short: 'Algebraic NT',
    glyph: '𝒪',
    color: '#81E6D9',
    tint: 'rgba(35,78,82,.50)',
    topic: 'algebraic',
    summary: R`Arithmetic of finite extensions $K/\mathbb{Q}$: the ring of integers $\mathcal{O}_K$, the failure of unique factorization measured by $\operatorname{Cl}(K)$, units, ramification and Galois action, and completions at primes. The central object:
$$\mathcal{O}_K=\{x\in K:\ x \text{ is integral over } \mathbb{Z}\}.$$`,
    topics: [
      { title: 'Number fields and rings of integers',
        md: R`$\mathcal{O}_K$ is a free $\mathbb{Z}$-module of rank $n=[K:\mathbb{Q}]$ with discriminant $d_K=\det\big(\operatorname{Tr}_{K/\mathbb{Q}}(\omega_i\omega_j)\big)$, and $d_K\equiv 0,1\pmod 4$ (Stickelberger). For squarefree $d$,
$$\mathcal{O}_{\mathbb{Q}(\sqrt d)}=\begin{cases}\mathbb{Z}\big[\tfrac{1+\sqrt d}{2}\big] & d\equiv 1\pmod 4,\\[2pt] \mathbb{Z}[\sqrt d] & d\equiv 2,3\pmod 4.\end{cases}$$` },
      { title: 'Dedekind domains and factorization',
        md: R`$\mathcal{O}_K$ is Dedekind, so every nonzero ideal factors uniquely as $\prod\mathfrak{p}^{a_\mathfrak{p}}$. **Kummer–Dedekind:** if $K=\mathbb{Q}(\alpha)$, $f$ the minimal polynomial of $\alpha$ and $p\nmid[\mathcal{O}_K:\mathbb{Z}[\alpha]]$, then $\bar f=\prod_i \bar g_i^{\,e_i}$ in $\mathbb{F}_p[x]$ gives
$$p\,\mathcal{O}_K=\prod_i \mathfrak{p}_i^{e_i},\qquad \mathfrak{p}_i=\big(p,\,g_i(\alpha)\big),\quad f_i=\deg \bar g_i,\quad \sum_i e_i f_i=n.$$` },
      { title: 'Ideal class groups',
        md: R`$\operatorname{Cl}(K)=I_K/P_K$ is finite. **Minkowski:** every class contains an integral ideal of norm at most
$$M_K=\sqrt{|d_K|}\left(\frac{4}{\pi}\right)^{r_2}\frac{n!}{n^{n}}.$$
Example: $K=\mathbb{Q}(\sqrt{-5})$ has $M_K\approx 2.85$, $(2)=\mathfrak{p}^2$ with $\mathfrak{p}=(2,1+\sqrt{-5})$ non-principal since $x^2+5y^2=2$ has no solution, so $\operatorname{Cl}(K)\cong\mathbb{Z}/2\mathbb{Z}$.` },
      { title: "Unit groups and Dirichlet's unit theorem",
        md: R`**Theorem (Dirichlet).** If $K$ has $r_1$ real and $r_2$ pairs of complex embeddings, then
$$\mathcal{O}_K^{\times}\cong\mu_K\times\mathbb{Z}^{\,r_1+r_2-1}.$$
*Proof sketch.* The logarithmic embedding $\ell(u)=\big(\log|\sigma_i(u)|\big)$, doubled at complex places, maps $\mathcal{O}_K^\times$ into the trace-zero hyperplane $H\subset\mathbb{R}^{r_1+r_2}$ with finite kernel $\mu_K$ and discrete image; Minkowski's convex body theorem produces enough units to make the image a full lattice in $H$. Its covolume, normalized, is the regulator $R_K$.` },
      { title: 'Galois theory applications',
        md: R`For $L/K$ Galois and $\mathfrak{P}\mid\mathfrak{p}$: $D_\mathfrak{P}/I_\mathfrak{P}\cong\operatorname{Gal}(k_\mathfrak{P}/k_\mathfrak{p})$, generated by the Frobenius $x\mapsto x^{N\mathfrak{p}}$, and $efg=[L:K]$. **Chebotarev:** for a conjugacy class $C\subseteq G$, the primes with $\operatorname{Frob}_\mathfrak{p}\in C$ have density $|C|/|G|$. Applied to $\mathbb{Q}(\zeta_p)\supset\mathbb{Q}(\sqrt{p^*})$, $p^*=(-1)^{(p-1)/2}p$, Frobenius at $q$ acts by $\big(\tfrac qp\big)$; comparing with the splitting of $q$ in $\mathbb{Q}(\sqrt{p^*})$ proves quadratic reciprocity.` },
      { title: 'Local fields and p-adic numbers',
        md: R`$\mathbb{Q}_p$ is the completion of $\mathbb{Q}$ for $|x|_p=p^{-v_p(x)}$, and $\mathbb{Z}_p=\varprojlim\mathbb{Z}/p^n\mathbb{Z}$. By Ostrowski, every nontrivial absolute value on $\mathbb{Q}$ is equivalent to $|\cdot|_\infty$ or some $|\cdot|_p$. **Hensel:** if $f\in\mathbb{Z}_p[x]$, $f(a)\equiv 0\pmod p$ and $f'(a)\not\equiv 0\pmod p$, there is a unique $\alpha\in\mathbb{Z}_p$ with $f(\alpha)=0$, $\alpha\equiv a$. For $p$ odd, $\mathbb{Q}_p^\times\cong p^{\mathbb{Z}}\times\mu_{p-1}\times(1+p\mathbb{Z}_p)$.` }
    ],
    cheat: [
      { label: 'Ring of integers', tex: R`\mathcal{O}_K=\{x\in K:\ x \text{ is integral over } \mathbb{Z}\}` },
      { label: 'Discriminant', tex: R`d_K=\det\big(\operatorname{Tr}_{K/\mathbb{Q}}(\omega_i\omega_j)\big)_{i,j}=\det\big(\sigma_i(\omega_j)\big)^2` },
      { label: 'Fundamental identity', tex: R`p\,\mathcal{O}_K=\prod_{i=1}^{g}\mathfrak{p}_i^{e_i}\ \Longrightarrow\ \sum_{i=1}^{g}e_if_i=[K:\mathbb{Q}]` },
      { label: 'Minkowski bound', tex: R`M_K=\sqrt{|d_K|}\left(\frac{4}{\pi}\right)^{r_2}\frac{n!}{n^{n}}` },
      { label: "Dirichlet's unit theorem", tex: R`\mathcal{O}_K^{\times}\cong\mu_K\times\mathbb{Z}^{\,r_1+r_2-1}` },
      { label: 'Dedekind zeta function', tex: R`\zeta_K(s)=\sum_{\mathfrak{a}\subseteq\mathcal{O}_K}\frac{1}{N(\mathfrak{a})^{s}}=\prod_{\mathfrak{p}}\left(1-N(\mathfrak{p})^{-s}\right)^{-1}` },
      { label: 'Analytic class number formula', tex: R`\operatorname*{Res}_{s=1}\zeta_K(s)=\frac{2^{r_1}(2\pi)^{r_2}\,h_K\,R_K}{w_K\sqrt{|d_K|}}` },
      { label: "Hensel's lemma", tex: R`f(a)\equiv 0 \!\!\pmod p,\ f'(a)\not\equiv 0 \!\!\pmod p\ \Longrightarrow\ \exists!\,\alpha\in\mathbb{Z}_p:\ f(\alpha)=0,\ \alpha\equiv a` },
      { label: 'Chebotarev density', tex: R`\lim_{x\to\infty}\frac{\#\{\mathfrak{p}:\ N\mathfrak{p}\le x,\ \operatorname{Frob}_{\mathfrak{p}}\in C\}}{\pi_K(x)}=\frac{|C|}{|G|}` },
      { label: 'p-adic integers', tex: R`\mathbb{Z}_p=\varprojlim_{n}\mathbb{Z}/p^{n}\mathbb{Z},\qquad |x|_p=p^{-v_p(x)}` }
    ],
    questions: [
      { title: 'Infinitely many real quadratic fields with h = 1?', status: 'Conjecture',
        md: R`Gauss conjectured that $h(\mathbb{Q}(\sqrt d))=1$ for infinitely many squarefree $d>0$. Cohen–Lenstra heuristics predict about $75.4\%$ of real quadratic fields of prime discriminant have class number one, yet infinitude is unproved.` },
      { title: 'Cohen–Lenstra heuristics', status: 'Conjecture',
        md: R`For odd $p$, the predicted probability that $p\nmid h(d)$ over imaginary quadratic fields is $\prod_{i\ge1}(1-p^{-i})\approx 0.560$ for $p=3$. Proven cases are scarce: Davenport–Heilbronn give the average $|\operatorname{Cl}(K)[3]|=2$ (imaginary) and $4/3$ (real); Bhargava computed average $2$-torsion for cubic fields.` },
      { title: "Leopoldt's conjecture", status: 'Conjecture',
        md: R`The $p$-adic regulator $R_{K,p}$ of a number field is nonzero, equivalently the $\mathbb{Z}_p$-rank of the closure of $\mathcal{O}_K^\times$ in $\prod_{\mathfrak{p}\mid p}\mathcal{O}_{K_\mathfrak{p}}^\times$ is $r_1+r_2-1$. Known for abelian extensions of $\mathbb{Q}$ or of imaginary quadratic fields (Brumer, via Baker's theorem); open in general.` },
      { title: 'The inverse Galois problem', status: 'Open problem',
        md: R`Is every finite group $G$ isomorphic to $\operatorname{Gal}(L/\mathbb{Q})$ for some $L$? Known for solvable groups (Shafarevich), symmetric and alternating groups (Hilbert) and all sporadic groups except possibly $M_{23}$.` },
      { title: "Hilbert's 12th problem", status: 'Active research',
        md: R`Find explicit generators of abelian extensions of a number field $K$, as $\mathbb{Q}(\zeta_n)$ does for $\mathbb{Q}$ (Kronecker–Weber) and CM values of modular functions do for imaginary quadratic $K$. Dasgupta–Kakde proved the Brumer–Stark conjecture away from $2$ (Annals, 2023), with the $2$-part completed by Dasgupta–Kakde–Silliman–Wang, and gave a $p$-adic analytic answer for totally real fields; the general case is open.` }
    ]
  }
];

export const DOMAIN_IDS = DOMAINS.map(d => d.id);
