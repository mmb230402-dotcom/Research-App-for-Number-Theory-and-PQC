/*
 * Ported verbatim from the reviewed desktop dashboard (app/index.html, PR #1).
 * Strings use String.raw so LaTeX backslashes survive; Markdown code fences
 * inside template literals use "~~~" because backticks would end the literal.
 */
import type { DomainId, Paper, SynthTemplate } from './types';

const R = String.raw;

/* =========================================================================
   DATA · arXiv Gateway (simulated)
   Every entry below is SYNTHETIC: titles, authors, identifiers and results
   are generated for demonstration and do not refer to real preprints.
   ========================================================================= */
export const PAPERS: Paper[] = [
  {
    id: '2610.04417', date: '2026-10-09', domain: 'pqc', cats: ['cs.CR', 'math.NT'],
    title: 'Search-to-Decision Reductions for Module-LWE over Arbitrary Galois Number Fields',
    authors: ['Amara Okonkwo', 'Lorenzo Marchetti', 'Szilvia Varga'],
    keywords: ['Module-LWE', 'Lattices', 'Search-to-decision', 'Number fields'],
    abstract: R`We give a polynomial-time search-to-decision reduction for $\mathsf{M\text{-}LWE}_{K,k,q,\psi}$ where $K$ is any Galois number field of degree $n$, $R=\mathcal{O}_K$, and $q$ splits into $g$ primes of residue degree $f$ with $q^{f}=\mathrm{poly}(n)$. Previous reductions required $K$ cyclotomic or $q$ totally split. We replace the CRT hybrid over $R_q\cong\bigoplus_{i=1}^{g}R/\mathfrak{q}_i$ by a guess-and-verify step over the residue fields $\mathbb{F}_{q^f}$, and use the transitivity of $\operatorname{Gal}(K/\mathbb{Q})$ on $\{\mathfrak{q}_i\}$ to keep the error distribution invariant. The advantage loss is $O(k\,g\,q^{f})$.`,
    result: R`**Theorem 1.1.** Let $K/\mathbb{Q}$ be Galois of degree $n$ with $q\mathcal{O}_K=\mathfrak{q}_1\cdots\mathfrak{q}_g$ and $N(\mathfrak{q}_i)=q^f\le\mathrm{poly}(n)$, and let $\psi$ be a $\operatorname{Gal}(K/\mathbb{Q})$-invariant error distribution. If an algorithm distinguishes $\big(\mathbf{a},\ \tfrac1q\langle\mathbf{a},\mathbf{s}\rangle+e\big)\in R_q^{k}\times\mathbb{T}_{R^\vee}$ from uniform with advantage $\varepsilon$, then $\mathbf{s}\in(R_q^\vee)^{k}$ can be recovered with probability $1-2^{-n}$ in time $\mathrm{poly}(n,k,q^f,1/\varepsilon)$.`,
    context: R`Extends Lyubashevsky–Peikert–Regev (cyclotomic, $q\equiv 1 \bmod m$) and Peikert–Regev–Stephens-Davidowitz (pseudorandomness for all rings, but via a worst-case detour). Covers ML-KEM's own ring $\mathbb{Z}_q[X]/(X^{256}+1)$: $q=3329\equiv 1 \bmod 256$ but $q\not\equiv 1 \bmod 512$, so $q$ splits into $g=128$ primes of residue degree $f=2$, a case not covered by Lyubashevsky–Peikert–Regev.`
  },
  {
    id: '2610.02951', date: '2026-10-03', domain: 'pqc', cats: ['cs.CR'],
    title: 'Decryption-Failure Amplification in ML-KEM-768 under Correlated Sampler Faults',
    authors: ['Kenji Arakawa', 'Priya Raghunathan'],
    keywords: ['CRYSTALS-Kyber', 'ML-KEM', 'Decryption failures', 'Side channels'],
    abstract: R`We study ML-KEM (FIPS 203) when an adversary can bias the centered binomial sampler $\beta_\eta$ through correlated faults. Writing the decryption noise as $\Delta=\mathbf{e}^{\mathsf T}\mathbf{r}-\mathbf{s}^{\mathsf T}\mathbf{e}_1+e_2+\Delta_{\mathrm{comp}}$, we show that forcing $w$ coefficients of $\mathbf{r}$ to $\pm\eta_1$ raises the failure probability from about $2^{-164}$ to $2^{-164+0.83w}$, a growth that, if it persisted beyond the range $w\le 96$ covered by Theorem 3.2 (where $\delta_w\lesssim 2^{-84}$), would enable key recovery from roughly $2^{20}$ faulted decapsulations when combined with a timing leak in implicit rejection. A constant-time sampler consistency check costs under $1\%$ of decapsulation time.`,
    result: R`**Theorem 3.2.** For ML-KEM-768 ($k=3$, $\eta_1=\eta_2=2$, $q=3329$), let $\delta_w=\Pr\big[\lVert\Delta\rVert_\infty\ge\lceil q/4\rfloor\big]$ when $w$ coefficients of $\mathbf{r}$ are forced to $\pm\eta_1$. Then $\log_2\delta_w\le -164+0.83\,w$ for $0\le w\le 96$.`,
    context: R`Combines the failure-boosting framework of D'Anvers et al. with fault models on the binomial sampler. Mitigation: re-encryption check plus constant-time comparison already required by FIPS 203.`
  },
  {
    id: '2609.11873', date: '2026-09-28', domain: 'pqc', cats: ['quant-ph', 'cs.CR', 'math.NT'],
    title: "Concrete Quantum Cost of CSIDH-1024 via Kuperberg's Collimation Sieve",
    authors: ['Élodie Fournier', 'Jonas Lindqvist', 'Mei-Lin Chou', 'Rafael Duarte'],
    keywords: ['Isogeny', 'CSIDH', 'Supersingular curves', 'Quantum algorithms'],
    abstract: R`CSIDH uses the free and transitive action of $\operatorname{Cl}(\mathbb{Z}[\sqrt{-p}])$ on the set $\mathcal{E}\ell\ell_p(\mathbb{Z}[\sqrt{-p}])$ of supersingular curves over $\mathbb{F}_p$. Key recovery is an abelian hidden shift problem, solvable with $2^{O(\sqrt{\log N})}$ quantum queries by Kuperberg-type sieves, $N=\#\operatorname{Cl}$. We estimate the full attack on CSIDH-1024, including evaluation of the group action in superposition, and obtain about $2^{71}$ T-gates with $2^{40}$ bits of quantumly accessible classical memory (QRACM) under Peikert's collimation sieve.`,
    result: R`**Theorem 5.1 (heuristic).** Let $N=h(-4p)$ with $p\approx 2^{1024}$. The collimation sieve of arity $r$ finds the hidden shift with $2^{\sqrt{2\log_2 N\,\log_2 r}\,(1+o(1))}$ oracle queries, each evaluating $[\mathfrak{a}]\star E$ for an ideal $\mathfrak{a}$ of norm at most $L_N[1/2,\sqrt2/2]$.`,
    context: R`Builds on Peikert (EUROCRYPT 2020) and Bonnetain–Schrottenloher (EUROCRYPT 2020). The dominant cost is the quantum evaluation of the class group action, not the sieve itself.`
  },
  {
    id: '2610.05520', date: '2026-10-10', domain: 'ant', cats: ['math.NT'],
    title: 'Selberg Sieve Weights and Large Values of Dirichlet Polynomials',
    authors: ['Ingrid Solberg', 'Yusuf Demir'],
    keywords: ['Selberg Sieve', 'Sieving', 'Large values', 'Dirichlet polynomials'],
    abstract: R`Let $D(t)=\sum_{N<n\le 2N}b_n n^{-it}$ with $|b_n|\le 1$. Combining Selberg's $\Lambda^2$ weights with the Guth–Maynard large-value estimate, we bound the number of $1$-separated $t\in[0,T]$ with $|D(t)|\ge N^{\sigma}$ when $b_n$ is supported on integers without prime factors below $N^{\varepsilon}$. As an application we obtain the expected asymptotic for integers in $(x,x+h]$ with exactly two prime factors, both exceeding $x^{\varepsilon}$, for almost all $x\le X$ with $h=X^{c}$ for an explicit $c<\tfrac16$.`,
    result: R`**Theorem 1.2.** Let $W$ be a set of $1$-separated points $t\in[0,T]$ with $|D(t)|\ge N^{\sigma}$, $\tfrac12\le\sigma\le1$. If $b_n=\lambda_n^{+}$ are Selberg upper-bound weights of level $N^{\theta}$, then
$$\#W\ll_\varepsilon T^{\varepsilon}\Big(N^{2-2\sigma}+N^{\frac{18}{5}-4\sigma-\frac{\theta}{5}}+T\,N^{\frac{12}{5}-4\sigma}\Big),$$
which improves the middle term of the Guth–Maynard estimate $N^{2-2\sigma}+N^{\frac{18}{5}-4\sigma}+T\,N^{\frac{12}{5}-4\sigma}$ for sieve-weighted polynomials.`,
    context: R`Sieve weights are smooth enough to be fed into large-value machinery, unlike the indicator of primes. Compare Heath-Brown's identity decompositions.`
  },
  {
    id: '2609.08802', date: '2026-09-21', domain: 'ant', cats: ['math.NT'],
    title: 'A Log-Free Zero-Density Estimate for Dirichlet L-functions near the 1-line',
    authors: ['Hana Kowalczyk', 'Daniel Okafor', 'Sofia Petrakis'],
    keywords: ['L-functions', 'Zero density', 'Riemann zeta', 'Dirichlet characters'],
    abstract: R`We prove a log-free zero-density estimate $\sum_{q\le Q}\sum^{*}_{\chi\bmod q}N(\sigma,T,\chi)\ll(Q^2T)^{c(1-\sigma)}$ for $\sigma\ge 1-\tfrac{1}{100}$ with an explicit constant $c$, by combining a power-sum method of Turán type with a mollified large sieve. As a corollary we recover Linnik's theorem $p_{\min}(q,a)\ll q^{L}$ with an explicit $L$, and a quantitative Deuring–Heilbronn repulsion for exceptional zeros.`,
    result: R`**Theorem 1.** There is an explicit absolute constant $c>0$ (Gallagher, 1970, proved a bound of this shape with an effective but unspecified $c$) such that for $Q,T\ge 2$ and $1-\tfrac{1}{100}\le\sigma\le 1$,
$$\sum_{q\le Q}\ \sum^{*}_{\chi \bmod q}N(\sigma,T,\chi)\ \ll\ (Q^{2}T)^{c(1-\sigma)},$$
where $N(\sigma,T,\chi)$ counts zeros $\rho=\beta+i\gamma$ of $L(s,\chi)$ with $\beta\ge\sigma$, $|\gamma|\le T$.`,
    context: R`Log-free density estimates near $\Re(s)=1$ are the engine behind Linnik's theorem; the best known exponent is $L\le 5$ (Xylouris).`
  },
  {
    id: '2610.03308', date: '2026-10-06', domain: 'algnt', cats: ['math.NT', 'math.AG'],
    title: 'Average 2-Torsion in Class Groups of Cubic Fields with a Fixed Quadratic Resolvent',
    authors: ['Mateo Rinaldi', 'Anika Bauer'],
    keywords: ['Class groups', 'Cohen–Lenstra', 'Cubic fields', 'Galois theory'],
    abstract: R`Bhargava showed that the average of $|\operatorname{Cl}(K)[2]|$ over cubic fields ordered by discriminant is $5/4$ for totally real and $3/2$ for complex cubic fields. We study the thin family of non-Galois cubic fields $K$ whose quadratic resolvent $\mathbb{Q}(\sqrt{d_K})$ is fixed, parametrized by $\mathrm{GL}_2(\mathbb{Z})$-classes of binary cubic forms of fixed discriminant class, and show the same averages persist, matching Cohen–Lenstra–Martinet predictions.`,
    result: R`**Theorem 1.** Fix a fundamental discriminant $D<0$. As $K$ ranges over cubic fields with $\mathbb{Q}(\sqrt{d_K})=\mathbb{Q}(\sqrt D)$ ordered by $|d_K|$,
$$\lim_{X\to\infty}\frac{\sum_{|d_K|\le X}|\operatorname{Cl}(K)[2]|}{\#\{K:\ |d_K|\le X\}}=\frac32.$$`,
    context: R`Uses parametrizations of quartic rings with cubic resolvents (Bhargava's higher composition laws) restricted by a congruence condition on the resolvent.`
  },
  {
    id: '2609.12046', date: '2026-09-30', domain: 'algnt', cats: ['math.NT'],
    title: 'Effective Chebotarev Bounds without GRH for Nilpotent Extensions',
    authors: ['Wen Zhao', 'Olusegun Adeyemi', 'Clara Moreau'],
    keywords: ['Chebotarev', 'Galois theory', 'L-functions', 'Number fields'],
    abstract: R`Let $L/K$ be Galois with group $G$ and $C\subseteq G$ a conjugacy class. Under GRH, Lagarias–Odlyzko give $\pi_C(x)=\frac{|C|}{|G|}\operatorname{Li}(x)+O\big(\frac{|C|}{|G|}x^{1/2}\log(d_L x^{n_L})\big)$; unconditionally, the least prime with Frobenius in $C$ has norm $\ll d_L^{A}$ (Lagarias–Montgomery–Odlyzko). For nilpotent $G$ we reduce to Hecke $L$-functions of monomial characters, where zero-free regions and log-free density estimates are stronger.`,
    result: R`**Theorem 1.3.** If $G=\operatorname{Gal}(L/K)$ is nilpotent, then for every conjugacy class $C$ there is a prime $\mathfrak{p}$ of $K$, unramified in $L$, with $\operatorname{Frob}_{\mathfrak{p}}\in C$ and $N\mathfrak{p}\ll d_L^{12}$, with an effective implied constant (Kadiri–Ng–Wong prove $N\mathfrak{p}\ll d_L^{16}$ for arbitrary $G$).`,
    context: R`Monomial (induced from abelian) characters let Artin $L$-functions be written as Hecke $L$-functions, which are entire — the key input missing for general $G$.`
  },
  {
    id: '2610.01164', date: '2026-10-01', domain: 'cnt', cats: ['math.NT', 'cs.DS'],
    title: 'Batch Smoothness Detection for the Number Field Sieve via Remainder Trees',
    authors: ['Tomás Ibarra', 'Szilvia Varga'],
    keywords: ['GNFS', 'Sieving', 'Integer factorization', 'Smoothness'],
    abstract: R`In the relation-collection phase of the general number field sieve, cofactors surviving lattice sieving must be tested for $B_2$-smoothness. We adapt Bernstein's batch algorithm — product tree for $P=\prod_{p\le B_2}p$, remainder tree for $P\bmod c_i$, then repeated squaring — to two-sided GNFS cofactorization with $L_N[1/3,(64/9)^{1/3}]$ parameters, and report the crossover against ECM-based cofactorization for 512- to 768-bit moduli.`,
    result: R`**Proposition 2.4.** A positive integer $c$ is $B$-smooth if and only if
$$\big(P \bmod c\big)^{2^{e}}\equiv 0\pmod c,\qquad P=\prod_{p\le B}p,$$
where $e\ge 0$ is minimal with $2^{2^{e}}\ge c$. Batch-testing integers of total size $M$ bits costs $(\log M)^{2+o(1)}$ bit operations per input bit.`,
    context: R`Proof of 2.4: every prime $p\mid c$ with $p\le B$ divides $P\bmod c$, and its exponent in $c$ is at most $\log_2 c\le 2^{e}$; a prime $p>B$ dividing $c$ never divides $P\bmod c$.`
  },
  {
    id: '2609.07715', date: '2026-09-18', domain: 'cnt', cats: ['math.NT', 'cs.SC'],
    title: 'Certifying Primality of 50,000-Digit Integers with Distributed fastECPP',
    authors: ['Ingrid Solberg', 'Kenji Arakawa', 'Rafael Duarte'],
    keywords: ['ECPP', 'Primality proving', 'Elliptic curves', 'Complex multiplication'],
    abstract: R`fastECPP builds a downrun $N=N_0>N_1>\dots$ where each step finds a discriminant $D$ with $4N_i=U^2+|D|V^2$, an elliptic curve with CM by $\mathcal{O}_D$ via a root of the Hilbert class polynomial $H_D$ modulo $N_i$, and a probable-prime cofactor $N_{i+1}$ of $\#E(\mathbb{F}_{N_i})$ exceeding $(N_i^{1/4}+1)^2$. We distribute the Cornacchia-and-trial-division phase over $10^4$ cores, and certify integers with about $50{,}000$ decimal digits with certificates checkable in a fraction of the proving time.`,
    result: R`**Theorem 4.1 (heuristic).** Under standard heuristics on the distribution of smooth numbers and class numbers, distributed fastECPP proves primality of $N$ in time $\widetilde O(\log^{4}N)$ with parallel depth $\widetilde O(\log^{3}N)$ on $\widetilde O(\log N)$ processors.`,
    context: R`Correctness of each certificate step is the Goldwasser–Kilian criterion; the CM method guarantees $\#E(\mathbb{F}_{N_i})=N_i+1\pm U$ when $N_i$ is prime.`
  },
  {
    id: '2610.06132', date: '2026-10-12', domain: 'crypto', cats: ['cs.CR', 'math.NT'],
    title: 'Pairing-Friendly Curves at the 192-bit Level after exTNFS',
    authors: ['Mei-Lin Chou', 'Lorenzo Marchetti'],
    keywords: ['Pairings', 'BLS signatures', 'exTNFS', 'Discrete log'],
    abstract: R`The extended tower number field sieve lowered the cost of discrete logarithms in $\mathbb{F}_{p^{k}}^{\times}$ for composite embedding degree $k$, invalidating earlier parameter choices such as Barreto–Naehrig curves with $p\approx 2^{256}$. For BLS signatures, $\sigma=x\,H(m)$ is verified by $e(\sigma,g_2)=e(H(m),x\,g_2)$, so security needs both a hard ECDLP in $\mathbb{G}_1,\mathbb{G}_2$ and a hard DLP in $\mathbb{G}_T\subset\mathbb{F}_{p^k}^\times$. We re-derive 192-bit parameters for the BLS24 and KSS18 families with explicit exTNFS cost models.`,
    result: R`**Proposition 3.** For the BLS24 family $r(u)=u^8-u^4+1$, $p(u)=\tfrac13(u-1)^2(u^8-u^4+1)+u$ with $k=24$ and $\rho=\log p/\log r=5/4$, every $u$ of $64$ bits with $p(u),r(u)$ prime gives a target group $\mathbb{F}_{p^{24}}^{\times}$ whose special-exTNFS cost exceeds $2^{192}$ in our model.`,
    context: R`Embedding degree trade-off: larger $k$ protects $\mathbb{G}_T$ but makes the final exponentiation and $\mathbb{G}_2$ arithmetic costlier.`
  },
  {
    id: '2609.10489', date: '2026-09-25', domain: 'crypto', cats: ['cs.CR'],
    title: 'Tight Security of Hashed ElGamal in the Algebraic Group Model',
    authors: ['Yusuf Demir', 'Amara Okonkwo', 'Jonas Lindqvist'],
    keywords: ['Diffie-Hellman', 'Discrete log', 'Algebraic group model', 'ElGamal'],
    abstract: R`We prove that IND-CCA security of hashed ElGamal key encapsulation in a prime-order group $\mathbb{G}=\langle g\rangle$ reduces tightly to the discrete logarithm problem in the algebraic group model combined with the random oracle model. Every algebraic adversary outputs group elements together with representations $Z=g^{a}X^{b}Y^{c}$, which lets the reduction answer decapsulation queries without a strong Diffie–Hellman oracle.`,
    result: R`**Theorem 2.** For every algebraic adversary $\mathcal{A}$ making $q_H$ random-oracle and $q_D$ decapsulation queries,
$$\mathrm{Adv}^{\mathrm{ind\text{-}cca}}_{\mathrm{HEG}}(\mathcal{A})\le 2\,\mathrm{Adv}^{\mathrm{dl}}_{\mathbb{G}}(\mathcal{B})+\frac{q_H+q_D}{p},$$
with $\mathcal{B}$ running in about the time of $\mathcal{A}$.`,
    context: R`The AGM sits between the standard model and the generic group model; Fuchsbauer–Kiltz–Loss (CRYPTO 2018) introduced it with similar reductions.`
  }
];

/* Keyword → domain classifier for synthesized entries */
export const DOMAIN_HINTS: [DomainId, RegExp][] = [
  ['pqc',    /lwe|lattice|kyber|ml-kem|mlkem|dilithium|ml-dsa|ntru|isogen|csidh|sqisign|post-quantum|pqc|falcon|sphincs|hash.?based|xmss|multivariate (?:crypt|sign|quadratic)|\buov\b|bkz|svp|code-based|mceliece|hqc/i],
  ['crypto', /\brsa\b|diffie|elgamal|ecdsa|ecc|pairing|bls|signature|discrete log|dlp|zero-knowledge|snark|commitment|hash|aes|cipher|crypt|authenticat|protocol/i],
  ['cnt',    /factor|nfs|field sieve|quadratic sieve|sieve of|primality|ecpp|\baks\b|pollard|ecm|point counting|schoof|smooth|algorithm|lll|\bsage/i],
  ['algnt',  /class group|class number|ideal|dedekind|unit|galois|p-adic|padic|local field|ramif|chebotarev|iwasawa|number field|cyclotomic|adele|idele/i],
  ['ant',    /zeta|l-function|sieve|selberg|prime|riemann|modular form|dirichlet|zero|goldbach|twin|exponential sum|circle method/i]
];

export const AUTHOR_POOL: string[] = ['Amara Okonkwo', 'Lorenzo Marchetti', 'Szilvia Varga', 'Kenji Arakawa', 'Priya Raghunathan',
  'Tomás Ibarra', 'Élodie Fournier', 'Jonas Lindqvist', 'Mei-Lin Chou', 'Rafael Duarte', 'Ingrid Solberg',
  'Yusuf Demir', 'Hana Kowalczyk', 'Daniel Okafor', 'Sofia Petrakis', 'Mateo Rinaldi', 'Anika Bauer',
  'Olusegun Adeyemi', 'Clara Moreau', 'Wen Zhao'];

/* Templates used when a tracked keyword matches none of the curated entries.
   {KW} is replaced by the keyword. */
export const SYNTH_TEMPLATES: Record<DomainId, SynthTemplate[]> = {
  pqc: [
    { title: 'Concrete Hardness of {KW} Instances against Primal and Dual Lattice Attacks',
      abstract: R`We estimate the cost of attacking lattice-based constructions related to {KW} via the primal uSVP embedding and the dual distinguisher. For a lattice of dimension $d$ and BKZ block size $\beta$ we use the geometric series assumption $\lVert\mathbf b_i^*\rVert\approx\delta_\beta^{\,d-2(i-1)}\det(\Lambda)^{1/d}$ and charge $2^{0.292\beta}$ per SVP call, comparing against the lattice estimator for parameter sets at NIST levels 1, 3 and 5.`,
      result: R`**Proposition.** The primal attack succeeds once $\sqrt{\beta}\,\sigma\le\delta_\beta^{\,2\beta-d}\det(\Lambda)^{1/d}$; for the recommended {KW} parameter sets the minimal such $\beta$ gives core-SVP cost $2^{0.292\beta}$, which we compare with NIST's gate-count targets $2^{143}$, $2^{207}$ and $2^{272}$ for levels 1, 3 and 5.` },
    { title: 'Side-Channel-Resilient Implementations of {KW} via Arithmetic Masking',
      abstract: R`We present a $t$-order masked implementation of the decapsulation of a lattice-based KEM related to {KW}. Secrets are split as $s=\sum_{i=0}^{t}s_i \bmod q$, and the non-linear compression $x\mapsto\lceil (2/q)x\rfloor \bmod 2$ is computed with a table-free arithmetic-to-Boolean conversion. We prove $t$-SNI composition and measure an overhead factor $O(t^2)$.`,
      result: R`**Theorem.** The masked decapsulation gadget is $t$-SNI, hence the full implementation is $t$-probing secure under the composition theorem of Barthe et al.` }
  ],
  crypto: [
    { title: 'Tight Reductions for {KW} in the Algebraic Group Model',
      abstract: R`We revisit the security of discrete-logarithm-based schemes related to {KW} in prime-order groups $\mathbb{G}=\langle g\rangle$. Exploiting the algebraic representations $Z=g^{a}X^{b}$ output by algebraic adversaries, we obtain tight reductions to the discrete logarithm problem with additive loss $O(q^2/p)$, where $q$ bounds the number of oracle queries.`,
      result: R`**Theorem.** $\mathrm{Adv}_{\text{{KW}}}(\mathcal{A})\le\mathrm{Adv}^{\mathrm{dl}}_{\mathbb{G}}(\mathcal{B})+\frac{q^2}{p}$ for every algebraic $\mathcal{A}$.` },
    { title: 'Lattice Attacks on {KW} with Partially Leaked Nonces',
      abstract: R`When $\ell$ most significant bits of each ECDSA-type nonce leak, recovering the key is an instance of the hidden number problem: find $\alpha$ given $t_i,u_i$ with $|t_i\alpha-u_i \bmod n|<n/2^{\ell+1}$. We analyse {KW} under this model and recover keys with lattice reduction plus sieving from as few as $m\approx\lceil\log_2 n/\ell\rceil$ signatures.`,
      result: R`**Proposition.** With $m$ samples the target vector has norm $\approx\sqrt{m}\,n/2^{\ell+1}$ in a lattice of determinant $n^{m}$, so key recovery succeeds heuristically when $m\,\ell>\log_2 n$.` }
  ],
  cnt: [
    { title: 'Algorithmic Aspects of {KW}: Complexity Bounds and Implementation',
      abstract: R`We give a rigorous and an implementation-oriented analysis of {KW}. Smoothness probabilities are controlled by the Dickman function, $\Psi(x,x^{1/u})=\rho(u)x(1+o(1))$, leading to a heuristic running time $L_N[1/2,\sqrt2+o(1)]$ for the basic variant and $L_N[1/3,c]$ for a number-field refinement.`,
      result: R`**Theorem.** Assuming smoothness heuristics, a number-field-sieve variant of the relation search used with {KW} runs in $L_N\!\big[\tfrac13,\sqrt[3]{64/9}+o(1)\big]$ bit operations.` },
    { title: 'Certified Computation with {KW} in PARI/GP and SageMath',
      abstract: R`We describe certified implementations related to {KW}, producing proofs checkable independently of the computation: Pratt and ECPP certificates for primality, and Atkin–Goldwasser–Kilian chains with verification cost $\widetilde O(\log^{3} N)$ per step.`,
      result: R`**Proposition.** Each certificate step verifies $mP=\mathcal O$, $(m/q)P\neq\mathcal O$ and $q>(N^{1/4}+1)^2$ with $q$ certified prime by the next step, so correctness reduces to the Goldwasser–Kilian criterion.` }
  ],
  algnt: [
    { title: 'Arithmetic Statistics of {KW} in Families of Number Fields',
      abstract: R`We study the distribution of invariants attached to {KW} in families of cubic fields ordered by discriminant. Using geometry-of-numbers counts for orbits of $\mathrm{GL}_2(\mathbb{Z})$ on binary cubic forms and of $\mathrm{GL}_2(\mathbb{Z})\times\mathrm{GL}_3(\mathbb{Z})$ on pairs of ternary quadratic forms, we prove averages consistent with Cohen–Lenstra–Martinet heuristics.`,
      result: R`**Theorem.** For cubic fields ordered by $|d_K|$, the average of $|\operatorname{Cl}(K)[2]|$ equals $5/4$ (totally real) and $3/2$ (complex), provided the local conditions imposed by {KW} form an acceptable set in the sense of Bhargava–Varma.` },
    { title: 'Explicit Methods for {KW}: Kummer–Dedekind and Beyond',
      abstract: R`We give algorithms for {KW} that compute $\mathcal{O}_K$ via the Round 2/Round 4 methods, factor $p\mathcal{O}_K=\prod\mathfrak{p}_i^{e_i}$ through Montes' algorithm when $p$ divides the index, and certify class groups under GRH using Bach's bound $N\mathfrak{p}\le 12\log^2|d_K|$.`,
      result: R`**Theorem (Bach, under GRH).** $\operatorname{Cl}(K)$ is generated by prime ideals of norm at most $12\log^2|d_K|$.` }
  ],
  ant: [
    { title: 'Mean Values and {KW}: a Large-Sieve Approach',
      abstract: R`We prove mean-value estimates related to {KW} using the multiplicative large sieve $\sum_{q\le Q}\frac{q}{\varphi(q)}\sum^{*}_{\chi}\big|\sum_{n\le N}a_n\chi(n)\big|^2\le(N+Q^2)\lVert a\rVert_2^2$, combined with a smoothed Heath-Brown identity, obtaining level of distribution $\tfrac12$ on average.`,
      result: R`**Theorem.** For every $A>0$ there is $B=B(A)>0$ such that $\sum_{q\le x^{1/2}(\log x)^{-B}}\max_{(a,q)=1}\big|\psi(x;q,a)-\frac{x}{\varphi(q)}\big|\ll_A x(\log x)^{-A}$ in the setting of {KW}.` },
    { title: 'Zeros of L-functions and {KW}',
      abstract: R`We relate {KW} to the vertical distribution of zeros $\rho=\tfrac12+i\gamma$ of $L(s,\chi)$ through the explicit formula $\psi(x,\chi)=-\sum_{\rho}\frac{x^{\rho}}{\rho}+O(\log^2 qx)$, and test the predictions of random matrix theory for pair correlation numerically.`,
      result: R`**Conjecture tested (Montgomery).** The pair correlation of normalized zeros has density $1-\big(\frac{\sin\pi u}{\pi u}\big)^2$.` }
  ]
};
