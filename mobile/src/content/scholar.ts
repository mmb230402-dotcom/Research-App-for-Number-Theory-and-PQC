/*
 * Ported verbatim from the reviewed desktop dashboard (app/index.html, PR #1).
 * Strings use String.raw so LaTeX backslashes survive; Markdown code fences
 * inside template literals use "~~~" because backticks would end the literal.
 */
import type { Intent, KBEntry, QuickAction, SeedChat, TopicId } from './types';

const R = String.raw;

/* =========================================================================
   DATA · Gemini Scholar (offline simulation)
   A small knowledge base keyed by topic × intent. The responder detects the
   topic from the prompt + attached context and the intent from the quick
   action or the wording, then assembles a Markdown + LaTeX answer.
   ========================================================================= */
export const QUICK_ACTIONS: QuickAction[] = [
  { emoji: '📝', label: 'Simplify this proof step',                     intent: 'simplify' },
  { emoji: '🛠️', label: 'Generate Python/SageMath/PARI/GP code for this', intent: 'code' },
  { emoji: '🔍', label: 'Explain this theorem intuitively',             intent: 'intuition' },
  { emoji: '🛡️', label: 'Analyze security implications (PQC context)',  intent: 'security' },
  { emoji: '📚', label: 'Recommend related papers',                     intent: 'papers' },
  { emoji: '🔬', label: 'Check Lean 4 formalization availability',      intent: 'lean' },
  { emoji: '📊', label: 'Provide research overview',                    intent: 'overview' }
];

/* Order matters: earlier entries win ties (isogeny before elliptic,
   factoring before algebraic so "number field sieve" is not misread). */
export const TOPIC_PATTERNS: [TopicId, RegExp][] = [
  ['isogeny',   /isogen|sidh|csidh|sqisign|supersingular|deuring|quaternion/gi],
  ['lattice',   /\blwe\b|lattice|kyber|ml-kem|ml-dsa|dilithium|ntru|ring-lwe|module-lwe|m-lwe|bkz|\bsvp\b|gaussian(?!\s+(?:integer|prime))|post-quantum/gi],
  ['factoring', /factor|gnfs|number field sieve|quadratic sieve|\brsa\b|primality|\baks\b|ecpp|miller|pollard|smooth|congruence of squares/gi],
  ['elliptic',  /elliptic|hasse|weierstrass|frobenius|schoof|ecdsa|ecdlp|pairing|weil|\btate\b|#e\(|point count/gi],
  ['algebraic', /number field|ring of integers|class group|class number|ideal|dedekind|units?\b|galois|p-adic|local field|hensel|minkowski|mathcal\{o\}_k|o_k|ramif|chebotarev/gi],
  ['zeta',      /zeta|riemann|l-function|l\(s|dirichlet|prime number theorem|sieve|selberg|modular form|explicit formula|siegel|\\psi|von mangoldt|lambda\(n\)/gi]
];

export const INTENT_PATTERNS: [Intent, RegExp][] = [
  ['code',      /\bcode\b(?!-based)|\bscripts?\b|\bsage(?:math)?\b|python|\bpari\b|\bgp\b|implement|\bcompute[sd]?\b|numeric/i],
  ['lean',      /lean|mathlib|formali[sz]/i],
  ['security',  /secur|attack|vulnerab|threat|side.channel|\bbreak(?!\s+down|through)/i],
  ['papers',    /paper|reference|literature|\bread(?:ing)?\b|survey|\bcite|recommend/i],
  ['simplify',  /simplif|proof step|step|clarify|break down|lemma/i],
  ['intuition', /intuit|explain|why|meaning|picture|\bideas?\b/i],
  ['overview',  /overview|state of the art|landscape|open problem|research/i]
];

export const KB: Record<TopicId, KBEntry> = {
  /* ------------------------------------------------------------- zeta */
  zeta: {
    name: 'analytic number theory',
    overview: R`### Research overview: zeta and $L$-functions
1. **Zero-free regions.** de la Vallée Poussin: $\zeta(\sigma+it)\neq0$ for $\sigma>1-\frac{c}{\log(|t|+2)}$; Vinogradov–Korobov improves this to $\sigma>1-\frac{c}{(\log|t|)^{2/3}(\log\log|t|)^{1/3}}$.
2. **Zero density.** Guth–Maynard (2024): $N(\sigma,T)\ll T^{30(1-\sigma)/13+\varepsilon}$, giving the PNT in intervals $[x,x+x^{17/30+\varepsilon}]$.
3. **Primes in progressions.** Bombieri–Vinogradov (level $\tfrac12$); Zhang and Maynard–Tao turned level-of-distribution input into bounded gaps.
4. **Automorphic $L$-functions.** Subconvexity $L(\tfrac12,\pi)\ll C(\pi)^{1/4-\delta}$ is known in many families; GRH and Lindelöf remain open.

*Status key:* RH, GRH, Lindelöf, twin primes — **open**; Bombieri–Vinogradov, Deligne's bound — **theorems**.`,
    intuition: R`### Intuition: primes are a Fourier dual of zeros
The Euler product $\zeta(s)=\prod_p(1-p^{-s})^{-1}$ is unique factorization written analytically. Taking $-\zeta'/\zeta$ and inverting with Perron's formula gives the explicit formula
$$\psi(x)=x-\sum_{\rho}\frac{x^{\rho}}{\rho}-\log 2\pi-\tfrac12\log(1-x^{-2}).$$
Each conjugate pair $\rho,\bar\rho$ with $\rho=\beta+i\gamma$ contributes a wave $-\frac{2x^{\beta}}{|\rho|}\cos(\gamma\log x-\arg\rho)$ whose size grows like $x^\beta$. The main term $x$ comes from the pole at $s=1$; RH says every wave grows like $\sqrt x$, i.e. the primes are "as regular as possible". Read it as a spectral decomposition: zeros are frequencies, primes the signal.`,
    simplify: R`### Simplifying the key step: why $\zeta(1+it)\neq0$
**Step 1 (trigonometric positivity).** $3+4\cos\theta+\cos2\theta=2(1+\cos\theta)^2\ge0$.

**Step 2 (apply to the Euler product).** For $\sigma>1$, $\log|\zeta(\sigma+it)|=\sum_{p,k}\frac{\cos(kt\log p)}{k\,p^{k\sigma}}$. Summing Step 1 with $\theta=kt\log p$:
$$\log\big|\zeta(\sigma)^3\zeta(\sigma+it)^4\zeta(\sigma+2it)\big|\ge0.$$
**Step 3 (orders of vanishing).** If $\zeta(1+it)=0$, then as $\sigma\to1^+$: $|\zeta(\sigma)|^3\asymp(\sigma-1)^{-3}$, $|\zeta(\sigma+it)|^4=O((\sigma-1)^4)$, $|\zeta(\sigma+2it)|=O(1)$. The product is $O(\sigma-1)\to0$, contradicting Step 2. $\blacksquare$

*Why 3–4–1:* the pole of order $3$ is outweighed by a zero of order $4$; any cosine polynomial $a_0+a_1\cos\theta+\dots+a_K\cos K\theta\ge0$ with all $a_k\ge0$ and $a_1>a_0$ works.`,
    code: R`### Code: explicit formula versus $\psi(x)$
~~~python
# Python + mpmath: compare psi(x) with the truncated explicit formula
from mpmath import mp, mpf, zetazero, log, pi, re

mp.dps = 20
K = 100
ZEROS = [zetazero(k) for k in range(1, K + 1)]   # rho_k = 1/2 + i*gamma_k

def psi(x):
    """Chebyshev psi(x) = sum_{p^k <= x} log p, by a sieve."""
    sieve = bytearray([1]) * (x + 1)
    sieve[0:2] = b"\x00\x00"
    total = mpf(0)
    for p in range(2, x + 1):
        if sieve[p]:
            sieve[p * p :: p] = bytearray(len(range(p * p, x + 1, p)))
            pk = p
            while pk <= x:
                total += log(p)
                pk *= p
    return total

def psi_explicit(x):
    x = mpf(x)
    s = x - log(2 * pi) - log(1 - x ** -2) / 2
    for rho in ZEROS:
        s -= 2 * re(x ** rho / rho)          # rho and its conjugate
    return s

for x in (100, 1000, 10000):
    print(x, float(psi(x)), float(psi_explicit(x + 0.5)))
~~~
~~~gp
\\ PARI/GP: zeros of zeta up to height 50, and L(1/2, chi_{-4})
lfunzeros(lfuncreate(1), 50)
lfun(lfuncreate(-4), 1/2)
~~~`,
    security: R`### Security relevance (analytic number theory)
This is mostly a *tool* for cryptography rather than an attack surface:
- **Prime generation:** by the PNT a random odd $1024$-bit integer is prime with probability $\approx 2/\ln 2^{1024}\approx 1/355$, which sets RSA key-generation cost.
- **Smoothness:** $\Psi(x,x^{1/u})\approx\rho(u)x$ (Dickman) governs index calculus and the NFS; it is the analytic core of every subexponential attack.
- **Character sums:** Weil/Burgess bounds certify the pseudorandomness of Legendre-symbol sequences and some hash constructions.
- **PQC:** Gaussian tail bounds and the smoothing parameter $\eta_\varepsilon(\Lambda)$ are analytic statements on theta series $\sum_{\mathbf x\in\Lambda^\vee}\rho_{1/s}(\mathbf x)$.

No known quantum speed-up here affects the hardness of LWE.`,
    papers: R`### Recommended reading
1. H. Davenport, *Multiplicative Number Theory*, 3rd ed., GTM 74 — the classical route to PNT in progressions.
2. H. Iwaniec, E. Kowalski, *Analytic Number Theory*, AMS Colloq. Publ. 53 (2004).
3. Y. Zhang, "Bounded gaps between primes", *Ann. of Math.* 179 (2014).
4. J. Maynard, "Small gaps between primes", *Ann. of Math.* 181 (2015).
5. L. Guth, J. Maynard, "New large value estimates for Dirichlet polynomials", arXiv:2405.20552 (2024).
6. J. Friedlander, H. Iwaniec, *Opera de Cribro*, AMS (2010).`,
    lean: R`### Lean 4 / Mathlib status (verify names against current Mathlib docs)
- $\zeta(s)$ is defined as riemannZeta, with the functional equation, the Euler product for $\Re s>1$, and $\zeta(2)=\pi^2/6$.
- Dirichlet characters, $L$-series and Dirichlet's theorem on primes in progressions have been formalized (2024–2025).
- The PNT with error term is the goal of the *PrimeNumberTheoremAnd* project (Kontorovich, Tao et al.); RH is stated but obviously unproven.
~~~lean
import Mathlib

#check riemannZeta
#check riemannZeta_two                     -- ζ 2 = π ^ 2 / 6
#check riemannZeta_neg_two_mul_nat_add_one -- trivial zeros
~~~`
  },

  /* --------------------------------------------------------- elliptic */
  elliptic: {
    name: 'elliptic curves',
    overview: R`### Research overview: elliptic curves
- **Over $\mathbb{F}_p$:** Hasse $|t|\le2\sqrt p$; Sato–Tate equidistribution of $t/(2\sqrt p)$ for non-CM curves over $\mathbb{Q}$ (Barnet-Lamb, Geraghty, Harris, Taylor, 2011); point counting by SEA in $\widetilde O(\log^4p)$.
- **Over $\mathbb{Q}$:** Mordell–Weil $E(\mathbb{Q})\cong\mathbb{Z}^r\oplus T$; BSD predicts $r=\operatorname{ord}_{s=1}L(E,s)$, known for analytic rank $\le1$ (Gross–Zagier, Kolyvagin). Average rank $<1$ (Bhargava–Shankar).
- **Cryptography:** ECDLP at $\approx\sqrt n$ generic cost; pairings with small embedding degree; vulnerable to Shor.`,
    intuition: R`### Intuition: why $|t|\le2\sqrt p$
Counting points is counting fixed points of Frobenius: $\#E(\mathbb{F}_p)=\deg(1-\pi)$. The degree is a **norm** on $\operatorname{End}(E)$: $\deg(m-n\pi)=m^2-tmn+pn^2$, and a norm is never negative. A binary quadratic form that is never negative must have nonpositive discriminant:
$$t^2-4p\le0\iff|t|\le2\sqrt p.$$
Equivalently, the eigenvalues $\alpha,\bar\alpha$ of Frobenius satisfy $|\alpha|=\sqrt p$: the Riemann hypothesis for the curve's zeta function $Z(E/\mathbb{F}_p,T)=\frac{1-tT+pT^2}{(1-T)(1-pT)}$.`,
    simplify: R`### Simplifying: from "degree is a quadratic form" to Hasse
1. $Q(m,n):=\deg(m-n\pi)\ge0$ for all $m,n\in\mathbb{Z}$, and $Q(m,n)=m^2-tmn+pn^2$.
2. $Q$ is homogeneous of degree 2, so $Q(m/k,n/k)=Q(m,n)/k^2\ge0$: nonnegative on $\mathbb{Q}^2$.
3. By continuity, $Q\ge0$ on $\mathbb{R}^2$. Take $n=1$: $m^2-tm+p\ge0$ for all real $m$.
4. A monic real quadratic that is never negative has discriminant $\le0$: $t^2-4p\le0$. $\blacksquare$

The only nontrivial input is Step 1's identity, which comes from $\deg(\alpha+\beta)+\deg(\alpha-\beta)=2\deg\alpha+2\deg\beta$ (degree is a quadratic form) and $\deg\pi=p$, $\deg(1-\pi)=p+1-t$.`,
    code: R`### Code: test Hasse's bound on random curves
~~~sage
# SageMath: empirical check of Hasse's bound |t| <= 2*sqrt(p)
for p in primes(10**4, 10**4 + 200):
    F = GF(p)
    while True:
        a, b = F.random_element(), F.random_element()
        if 4*a**3 + 27*b**2 != 0:
            break
    E = EllipticCurve(F, [a, b])
    t = p + 1 - E.order()
    assert t**2 <= 4*p, (p, a, b, t)
    print(p, t, float(t / (2*sqrt(p))))   # normalized trace in [-1, 1]
~~~
~~~gp
\\ PARI/GP: trace of Frobenius and group structure
E = ellinit([2, 3], 10007);
ellap(E)          \\ t = p + 1 - #E(F_p)
ellcard(E)        \\ #E(F_p)
ellgroup(E)       \\ invariants [d1, d2] with d2 | d1
~~~
Plotting the normalized traces for a fixed non-CM curve over $\mathbb{Q}$ as $p$ varies approximates the Sato–Tate density $\frac{2}{\pi}\sqrt{1-x^2}$ (for a CM curve half the traces are $0$).`,
    security: R`### Security analysis: elliptic-curve deployments
- **Generic attacks:** Pollard $\rho$ in $\approx\sqrt{\pi n/2}$; choose prime-order subgroups with $n\approx2^{256}$ for 128-bit security.
- **Structural weaknesses:** anomalous curves ($\#E=p$: Smart–Satoh–Araki–Semaev, polynomial time); small embedding degree (MOV/Frey–Rück); weak twists and invalid-curve attacks when points are not validated.
- **Implementation:** ECDSA nonce reuse or bias $\Rightarrow$ key recovery via the hidden number problem; non-constant-time scalar multiplication.
- **Quantum (PQC context):** Shor solves ECDLP in polynomial time; Roetteler–Naehrig–Svore–Lauter show that at most $9m+2\lceil\log_2 m\rceil+10$ logical qubits suffice for an $m$-bit prime field, i.e. $2330$ for $m=256$. "Harvest now, decrypt later" makes ECDH the urgent case: migrate to hybrid X25519 + ML-KEM-768.`,
    papers: R`### Recommended reading
1. J. H. Silverman, *The Arithmetic of Elliptic Curves*, 2nd ed., GTM 106 (2009).
2. L. C. Washington, *Elliptic Curves: Number Theory and Cryptography*, 2nd ed. (2008).
3. R. Schoof, "Elliptic curves over finite fields and the computation of square roots mod $p$", *Math. Comp.* 44 (1985).
4. A. Menezes, T. Okamoto, S. Vanstone, "Reducing elliptic curve logarithms to logarithms in a finite field", *IEEE Trans. IT* 39 (1993).
5. M. Roetteler, M. Naehrig, K. Svore, K. Lauter, "Quantum resource estimates for computing elliptic curve discrete logarithms", ASIACRYPT 2017.`,
    lean: R`### Lean 4 / Mathlib status (verify names against current Mathlib docs)
- Weierstrass curves, the discriminant and $j$-invariant are in Mathlib (WeierstrassCurve), and the group law on nonsingular points is formalized (Angdinata–Xu).
- Hasse's bound, Mordell–Weil and BSD are **not** in Mathlib as far as I know; the FLT project (Buzzard et al.) is building related infrastructure.
~~~lean
import Mathlib

#check WeierstrassCurve
#check WeierstrassCurve.Affine.Point   -- carries an AddCommGroup instance
~~~`
  },

  /* ---------------------------------------------------------- lattice */
  lattice: {
    name: 'lattice-based cryptography',
    overview: R`### Research overview: lattice-based cryptography
- **Standards:** FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), FIPS 205 (SLH-DSA, hash-based), all August 2024; FN-DSA (Falcon) in preparation; HQC (code-based) selected in 2025 as a backup KEM.
- **Foundations:** quantum worst-case to average-case reductions $\mathsf{GapSVP}_\gamma,\mathsf{SIVP}_\gamma\le\mathsf{LWE}$ (Regev; classical for $\mathsf{GapSVP}$: Peikert 2009, Brakerski–Langlois–Peikert–Regev–Stehlé 2013), ideal lattices $\le$ Ring-LWE (LPR), module lattices $\le$ Module-LWE (Langlois–Stehlé).
- **Concrete security:** BKZ with sieving, $2^{0.292\beta}$ classical; open debate on dual attacks (Ducas–Pulles 2023).
- **Open:** is ideal-SVP easier for polynomial factors? Is Module-LWE strictly harder than Ring-LWE?`,
    intuition: R`### Intuition: LWE is noisy linear algebra
Given $\mathbf b=\mathbf A\mathbf s+\mathbf e \pmod q$, Gaussian elimination would recover $\mathbf s$ if $\mathbf e=0$. The small error makes every equation slightly wrong, and elimination amplifies the error until it is uniform.
$$\mathsf{LWE}_{n,q,\chi}:\ (\mathbf A,\mathbf A\mathbf s+\mathbf e)\ \approx_c\ (\mathbf A,\mathbf u).$$
Geometrically, $\mathbf b$ is a point close to the lattice $\Lambda_q(\mathbf A)=\{\mathbf A\mathbf x\bmod q\}$, and recovering $\mathbf s$ is bounded-distance decoding. Ring/Module-LWE replace $\mathbf A$ by a structured matrix (multiplication in $\mathbb{Z}_q[x]/(x^n+1)$), cutting key sizes from $O(n^2)$ to $O(n)$ and allowing $O(n\log n)$ multiplication via the NTT.`,
    simplify: R`### Simplifying: why ML-KEM decryption works
Let $\mathbf t=\mathbf A\mathbf s+\mathbf e$, $\mathbf u=\mathbf A^{\mathsf T}\mathbf r+\mathbf e_1$, $v=\mathbf t^{\mathsf T}\mathbf r+e_2+\lceil q/2\rfloor m$.

**Step 1.** Expand: $v-\mathbf s^{\mathsf T}\mathbf u=(\mathbf A\mathbf s+\mathbf e)^{\mathsf T}\mathbf r+e_2+\lceil q/2\rfloor m-\mathbf s^{\mathsf T}\mathbf A^{\mathsf T}\mathbf r-\mathbf s^{\mathsf T}\mathbf e_1$.

**Step 2.** The large terms cancel because $(\mathbf A\mathbf s)^{\mathsf T}\mathbf r=\mathbf s^{\mathsf T}\mathbf A^{\mathsf T}\mathbf r$:
$$v-\mathbf s^{\mathsf T}\mathbf u=\left\lceil\tfrac q2\right\rfloor m+\underbrace{\mathbf e^{\mathsf T}\mathbf r-\mathbf s^{\mathsf T}\mathbf e_1+e_2}_{\text{small}}.$$
**Step 3.** Each coefficient is near $0$ (bit $0$) or near $q/2$ (bit $1$); rounding is correct whenever $\lVert\mathbf e^{\mathsf T}\mathbf r-\mathbf s^{\mathsf T}\mathbf e_1+e_2\rVert_\infty<q/4$. In ML-KEM the failure probability, including compression noise, is below $2^{-138}$ for every parameter set.`,
    code: R`### Code: toy Module-LWE encryption (not constant-time, not ML-KEM-compliant)
~~~python
import random

n, q, k, eta = 256, 3329, 2, 2          # ring Z_q[x]/(x^256 + 1), rank 2

def polymul(a, b):
    """Negacyclic product in Z_q[x]/(x^n + 1), schoolbook O(n^2)."""
    c = [0] * n
    for i, ai in enumerate(a):
        if ai:
            for j, bj in enumerate(b):
                if i + j < n: c[i + j] += ai * bj
                else:         c[i + j - n] -= ai * bj
    return [x % q for x in c]

def add(*ps): return [sum(cs) % q for cs in zip(*ps)]
def cbd():    return [sum(random.getrandbits(1) - random.getrandbits(1) for _ in range(eta)) % q for _ in range(n)]
def matvec(M, v): return [add(*(polymul(M[i][j], v[j]) for j in range(k))) for i in range(k)]
def dot(u, v):    return add(*(polymul(a, b) for a, b in zip(u, v)))

A  = [[[random.randrange(q) for _ in range(n)] for _ in range(k)] for _ in range(k)]
At = [[A[j][i] for j in range(k)] for i in range(k)]
s, e = [cbd() for _ in range(k)], [cbd() for _ in range(k)]
t = [add(x, y) for x, y in zip(matvec(A, s), e)]                 # t = A s + e

m = [random.getrandbits(1) for _ in range(n)]
r, e1, e2 = [cbd() for _ in range(k)], [cbd() for _ in range(k)], cbd()
u = [add(x, y) for x, y in zip(matvec(At, r), e1)]               # u = A^T r + e1
v = add(dot(t, r), e2, [(q + 1) // 2 * b for b in m])            # v = t^T r + e2 + round(q/2) m

w = [(a - b) % q for a, b in zip(v, dot(s, u))]                  # v - s^T u
print("decryption correct:", [int(q // 4 < x < 3 * q // 4) for x in w] == m)
~~~
~~~sage
# SageMath: the ring and an NTT-friendly check
R.<x> = PolynomialRing(GF(3329)); S = R.quotient(x^256 + 1)
print(GF(3329)(17).multiplicative_order())   # 256: zeta = 17 gives the Kyber NTT
~~~`,
    security: R`### Security analysis (PQC context)
- **Lattice attacks:** primal uSVP and dual distinguishers, costed via BKZ block size $\beta$ and $2^{0.292\beta}$ sieving; use the lattice estimator rather than ad hoc formulas. ML-KEM-512/768/1024 target NIST categories 1/3/5.
- **Decryption failures:** failure-boosting attacks need many queries against a reused key; the FO transform with implicit rejection and the tiny failure rate keep this out of reach for standard parameters.
- **Side channels:** secret-dependent division by $q$ caused the *KyberSlash* timing leaks (2024) in several implementations; masking and constant-time compression are required.
- **Misuse:** skipping the re-encryption check or reusing CPA-secure keys enables key-mismatch attacks.
- **Hybrids:** deploy ML-KEM-768 combined with X25519 during transition so that security holds if either component survives.`,
    papers: R`### Recommended reading
1. O. Regev, "On lattices, learning with errors, random linear codes, and cryptography", *J. ACM* 56 (2009).
2. V. Lyubashevsky, C. Peikert, O. Regev, "On ideal lattices and learning with errors over rings", EUROCRYPT 2010; *J. ACM* 60 (2013).
3. A. Langlois, D. Stehlé, "Worst-case to average-case reductions for module lattices", *Des. Codes Cryptogr.* 75 (2015).
4. J. Bos et al., "CRYSTALS-Kyber: a CCA-secure module-lattice-based KEM", IEEE EuroS&P 2018.
5. L. Ducas, L. Pulles, "Does the dual-sieve attack on learning with errors even work?", CRYPTO 2023.
6. NIST, FIPS 203: *Module-Lattice-Based Key-Encapsulation Mechanism Standard* (2024).`,
    lean: R`### Formalization status (verify against current sources)
- **Mathlib** has the algebra needed (ZMod, polynomials, AdjoinRoot, cyclotomic polynomials and IsCyclotomicExtension) but no LWE or lattice-reduction theory.
- **Verified implementations** of ML-KEM exist in other systems: EasyCrypt/Jasmin (formosa-crypto) and hax/F* (libcrux), proving functional correctness and constant-time properties.
~~~lean
import Mathlib

-- the ML-KEM ring  Z_3329[x]/(x^256 + 1)
abbrev Rq := AdjoinRoot (Polynomial.X ^ 256 + 1 : Polynomial (ZMod 3329))
#check (inferInstance : CommRing Rq)
~~~`
  },

  /* ---------------------------------------------------------- isogeny */
  isogeny: {
    name: 'isogeny-based cryptography',
    overview: R`### Research overview: isogenies
- **SIDH/SIKE broken (2022)** in polynomial time by Castryck–Decru, Maino–Martindale and Robert, via Kani's theorem and higher-dimensional isogenies.
- **Survivors:** CSIDH (commutative group action, subexponential quantum attack), SQIsign (signatures from the Deuring correspondence; advanced to round 2 of NIST's additional-signature process in October 2024), and new 2-dimensional variants.
- **Hardness:** the supersingular endomorphism-ring problem and isogeny path finding are equivalent under GRH (Wesolowski, FOCS 2021).`,
    intuition: R`### Intuition: walks on a Ramanujan graph
Supersingular curves over $\overline{\mathbb{F}}_p$ number about $p/12$; the $\ell$-isogeny graph on them is $(\ell+1)$-regular and Ramanujan (Pizer), so random walks mix in $O(\log p)$ steps. Finding a path between two given curves is hard unless you know an endomorphism ring. The **Deuring correspondence** maps curves to maximal orders in the quaternion algebra $B_{p,\infty}$ and isogenies to ideals; translating back and forth is easy *given* the orders, which is what SQIsign exploits.`,
    simplify: R`### Simplifying: why the CSIDH action is well defined
1. Let $\mathcal{O}=\mathbb{Z}[\sqrt{-p}]$ and $E/\mathbb{F}_p$ supersingular with $\operatorname{End}_{\mathbb{F}_p}(E)\cong\mathcal{O}$.
2. For an invertible ideal $\mathfrak a\subseteq\mathcal{O}$ put $E[\mathfrak a]=\bigcap_{\alpha\in\mathfrak a}\ker\alpha$ and $\phi_{\mathfrak a}:E\to E/E[\mathfrak a]$; then $\deg\phi_{\mathfrak a}=N(\mathfrak a)$.
3. Principal ideals $(\alpha)$ give $E/E[(\alpha)]\cong E$, so the action factors through $\operatorname{Cl}(\mathcal{O})$.
4. $E[\mathfrak{ab}]$ corresponds to composing $\phi_{\mathfrak a}$ and $\phi_{\mathfrak b}$, so $[\mathfrak a]\star([\mathfrak b]\star E)=[\mathfrak{ab}]\star E$, and commutativity of $\operatorname{Cl}(\mathcal{O})$ gives the Diffie–Hellman-style key exchange.
5. The action is free and transitive (theory of complex multiplication over $\mathbb{F}_p$).`,
    code: R`### Code: the supersingular 2-isogeny graph
~~~sage
# SageMath: BFS on supersingular j-invariants over F_{p^2} via 2-isogenies
from collections import deque
p = 431                                    # p = 3 (mod 4), so j = 1728 is supersingular
F = GF(p**2, 'i', modulus=[1, 0, 1])       # F_p[i]/(i^2 + 1)
E0 = EllipticCurve(F, [1, 0])              # y^2 = x^3 + x
seen, edges, queue = {E0.j_invariant()}, [], deque([E0])
while queue:
    C = queue.popleft()
    for phi in C.isogenies_prime_degree(2):
        D = phi.codomain()
        edges.append((C.j_invariant(), D.j_invariant()))
        if D.j_invariant() not in seen:
            seen.add(D.j_invariant()); queue.append(D)
print(len(seen), "vertices; formula gives floor(p/12) + 2 =", p // 12 + 2)   # 37
~~~`,
    security: R`### Security analysis (PQC context)
- **Lesson of SIDH:** revealing the images of torsion points under a secret isogeny gave enough information for Kani-based recovery; any new scheme must justify what auxiliary points it publishes.
- **CSIDH:** key recovery is an abelian hidden shift problem, so Kuperberg-type sieves run in $2^{O(\sqrt{\log N})}$; Peikert (2020) and Bonnetain–Schrottenloher (2020) argue CSIDH-512 is below NIST level 1, and suggested parameters grew to $p\approx2^{2000}$ or more.
- **SQIsign:** security rests on endomorphism-ring hardness; implementations need constant-time ideal-to-isogeny translation.`,
    papers: R`### Recommended reading
1. W. Castryck, T. Decru, "An efficient key recovery attack on SIDH", EUROCRYPT 2023.
2. D. Robert, "Breaking SIDH in polynomial time", EUROCRYPT 2023.
3. W. Castryck, T. Lange, C. Martindale, L. Panny, J. Renes, "CSIDH: an efficient post-quantum commutative group action", ASIACRYPT 2018.
4. L. De Feo, D. Kohel, A. Leroux, C. Petit, B. Wesolowski, "SQISign: compact post-quantum signatures from quaternions and isogenies", ASIACRYPT 2020.
5. B. Wesolowski, "The supersingular isogeny path and endomorphism ring problems are equivalent", FOCS 2021.
6. C. Peikert, "He gives C-sieves on the CSIDH", EUROCRYPT 2020.`,
    lean: R`### Lean 4 / Mathlib status
Mathlib has quaternion algebras (QuaternionAlgebra) and Weierstrass curves, but isogenies of elliptic curves, supersingularity and the Deuring correspondence are **not** formalized there as far as I know. This is a realistic thesis-sized formalization target.`
  },

  /* -------------------------------------------------------- algebraic */
  algebraic: {
    name: 'algebraic number theory',
    overview: R`### Research overview: algebraic number theory
- **Arithmetic statistics:** Davenport–Heilbronn (average $|\operatorname{Cl}[3]|$ is $2$ imaginary, $4/3$ real quadratic), Bhargava's parametrizations (average $2$-torsion in cubic class groups), Cohen–Lenstra–Martinet heuristics.
- **Class field theory, explicitly:** Hilbert's 12th problem; Dasgupta–Kakde on Brumer–Stark and explicit $p$-adic class field theory for totally real fields.
- **Iwasawa theory:** $\mu=0$ for cyclotomic $\mathbb{Z}_p$-extensions of abelian fields (Ferrero–Washington); main conjectures; Leopoldt's conjecture open in general.
- **Computation:** class groups and units in subexponential time under GRH (Buchmann).`,
    intuition: R`### Intuition: geometry of numbers controls arithmetic
Embed $\mathcal{O}_K$ into $\mathbb{R}^{r_1}\times\mathbb{C}^{r_2}\cong\mathbb{R}^n$; it becomes a lattice of covolume $2^{-r_2}\sqrt{|d_K|}$.
- **Class groups:** a convex symmetric body of large volume contains a lattice point, so every ideal class contains an ideal of small norm $\le M_K$: finitely many classes.
- **Units:** taking logarithms of absolute values turns the multiplicative group $\mathcal{O}_K^\times$ into an additive lattice in the hyperplane $\sum x_i=0$ of dimension $r_1+r_2-1$.

Unique factorization fails exactly when $\operatorname{Cl}(K)\neq1$; ideals restore it.`,
    simplify: R`### Simplifying: computing $\operatorname{Cl}(\mathbb{Q}(\sqrt{-5}))$
1. $d_K=-20$, $n=2$, $r_2=1$: $M_K=\sqrt{20}\cdot\frac4\pi\cdot\frac{2}{4}=\frac{2\sqrt{20}}{\pi}\approx2.85$.
2. So the class group is generated by primes of norm $2$; $x^2+5\equiv(x+1)^2\pmod 2$ gives $(2)=\mathfrak p^2$, $\mathfrak p=(2,1+\sqrt{-5})$.
3. $\mathfrak p$ is not principal: $N(a+b\sqrt{-5})=a^2+5b^2=2$ has no integer solution.
4. $\mathfrak p^2=(2)$ is principal, so $[\mathfrak p]$ has order exactly $2$ and $\operatorname{Cl}(K)\cong\mathbb{Z}/2\mathbb{Z}$. $\blacksquare$`,
    code: R`### Code: class groups, units and splitting
~~~sage
# SageMath
R.<x> = QQ[]
K.<a> = NumberField(x^2 + 5)
print(K.class_group())                  # cyclic of order 2
print(K.factor(2), K.factor(3))         # (2) = p^2,  (3) = p3 * p3'
L.<b> = NumberField(x^3 - 2)
print(L.unit_group().gens_values())     # torsion -1 and a fundamental unit (b - 1 up to sign/inverse)
print(L.signature())                    # (1, 1): unit rank r1 + r2 - 1 = 1
~~~
~~~gp
\\ PARI/GP
bnf = bnfinit(x^2 + 5);
bnf.clgp          \\ [2, [2], ...]
idealfactor(bnf, 6)
bnfinit(x^3 - 2, 1).fu   \\ fundamental units of Q(cbrt 2)
~~~`,
    security: R`### Security relevance
- **Class groups as groups of unknown order:** $\operatorname{Cl}(\mathcal{O}_D)$ for imaginary quadratic discriminants underlies trustless-setup VDFs (Wesolowski, Pietrzak) and accumulators; security assumes computing $h(D)$ is hard for $|D|\approx2^{2048}$ or more.
- **CSIDH** uses the action of $\operatorname{Cl}(\mathbb{Z}[\sqrt{-p}])$; its quantum security is a hidden shift problem.
- **Ideal lattices:** the log-unit lattice of cyclotomic fields enables the Cramer–Ducas–Peikert–Regev attack on *principal* ideal problems with short generators. It does not break Ring-LWE, but it shows that algebraic structure can be exploited.`,
    papers: R`### Recommended reading
1. J. Neukirch, *Algebraic Number Theory*, Grundlehren 322 (1999).
2. D. A. Marcus, *Number Fields*, 2nd ed., Springer (2018).
3. H. Cohen, *A Course in Computational Algebraic Number Theory*, GTM 138 (1993).
4. H. Cohen, H. W. Lenstra Jr., "Heuristics on class groups of number fields", LNM 1068 (1984).
5. M. Bhargava, "The density of discriminants of quartic rings and fields", *Ann. of Math.* 162 (2005).
6. S. Dasgupta, M. Kakde, "On the Brumer–Stark conjecture", *Ann. of Math.* 197 (2023).`,
    lean: R`### Lean 4 / Mathlib status (verify names against current Mathlib docs)
- Number fields, rings of integers ($\mathcal{O}_K$ as 𝓞 K), finiteness of the class group and the class number are in Mathlib.
- Dirichlet's unit theorem is formalized (NumberField.Units); the Hermite–Minkowski finiteness theorem was added in 2024.
- $p$-adic numbers ($\mathbb{Q}_p$ as ℚ_[p], $\mathbb{Z}_p$ as ℤ_[p]) and Hensel's lemma are available.
~~~lean
import Mathlib
open NumberField

variable (K : Type*) [Field K] [NumberField K]
#check 𝓞 K                   -- ring of integers
#check NumberField.classNumber K
#check NumberField.Units.rank K   -- r₁ + r₂ - 1
~~~`
  },

  /* -------------------------------------------------------- factoring */
  factoring: {
    name: 'primality and factorization',
    overview: R`### Research overview: primality and factoring
- **Records:** RSA-250 (829 bits) was factored in February 2020 with CADO-NFS (Boudot, Gaudry, Guillevic, Heninger, Thomé, Zimmermann), about $2700$ core-years.
- **Primality:** AKS is deterministic polynomial; in practice BPSW plus ECPP certificates for large numbers.
- **Quantum:** Gidney (2025) estimates RSA-2048 could be factored with fewer than one million noisy qubits in under a week, down from about 20 million (Gidney–Ekerå 2019).
- **Policy:** NIST IR 8547 (draft, 2024) proposes deprecating 112-bit RSA/ECC after 2030 and disallowing all quantum-vulnerable RSA/ECC, at every security level, after 2035.`,
    intuition: R`### Intuition: the number field sieve
All modern general-purpose sieve algorithms (QS, NFS) find $x^2\equiv y^2\pmod N$ with $x\not\equiv\pm y$; then $\gcd(x-y,N)$ is a proper factor. Squares are assembled from many **smooth** numbers whose exponent vectors sum to $0$ mod $2$, which is linear algebra over $\mathbb{F}_2$.

The NFS makes the numbers smaller: instead of values of size $\sqrt N$ (quadratic sieve) it uses two sides of size about $N^{1/d}$, linked by the ring map $\mathbb{Z}[\alpha]\to\mathbb{Z}/N\mathbb{Z}$, $\alpha\mapsto m$. Smaller numbers are smooth more often, which moves the exponent from $L_N[1/2]$ to $L_N[1/3]$.`,
    simplify: R`### Simplifying: congruence of squares
1. Suppose $N$ is odd with at least two distinct prime factors and $x^2\equiv y^2\pmod N$.
2. Then $N\mid(x-y)(x+y)$. If $x\not\equiv\pm y\pmod N$, then $N\nmid x-y$ and $N\nmid x+y$, so $\gcd(x-y,N)$ is a proper divisor.
3. For a random dependency, $x/y\bmod N$ behaves like a random square root of $1$; there are $2^{k}$ of them for $k$ distinct prime factors, and only $2$ are $\pm1$, so each dependency succeeds with probability $\ge1/2$. $\blacksquare$`,
    code: R`### Code: Miller–Rabin and Pollard–Brent
~~~python
import math, random

def is_probable_prime(n, rounds=25):
    """Miller-Rabin; error probability <= 4^(-rounds) for composite n."""
    if n < 2:
        return False
    for p in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
        if n % p == 0:
            return n == p
    d, s = n - 1, 0
    while d % 2 == 0:
        d //= 2; s += 1
    for _ in range(rounds):
        x = pow(random.randrange(2, n - 1), d, n)
        if x in (1, n - 1):
            continue
        for _ in range(s - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                break
        else:
            return False
    return True

def pollard_brent(n):
    """Non-trivial factor of an odd composite n (Brent's cycle detection)."""
    while True:
        y, c, m = random.randrange(1, n), random.randrange(1, n), 128
        g, r, q = 1, 1, 1
        while g == 1:
            x = y
            for _ in range(r):
                y = (y * y + c) % n
            k = 0
            while k < r and g == 1:
                ys = y
                for _ in range(min(m, r - k)):
                    y = (y * y + c) % n
                    q = q * abs(x - y) % n
                g = math.gcd(q, n)
                k += m
            r *= 2
        if g == n:
            g = 1
            while g == 1:
                ys = (ys * ys + c) % n
                g = math.gcd(abs(x - ys), n)
        if g != n:
            return g

def factor(n):
    if n == 1:
        return []
    if n % 2 == 0:
        return [2] + factor(n // 2)
    if is_probable_prime(n):
        return [n]
    d = pollard_brent(n)
    return sorted(factor(d) + factor(n // d))

print(factor(2**64 + 1))   # [274177, 67280421310721]  (Landry, 1880)
~~~
~~~gp
\\ PARI/GP: factorization and an ECPP certificate
factor(2^128 + 1)
primecert(10^100 + 267)
~~~`,
    security: R`### Security analysis: RSA in practice
- **Key generation:** shared primes across devices (Heninger et al. 2012; Lenstra et al. 2012) and structured primes (ROCA, CVE-2017-15361, exploited with Coppersmith's method).
- **Small exponents:** Wiener ($d<\frac13N^{1/4}$), Boneh–Durfee ($d<N^{0.292}$), Håstad broadcast with $e=3$.
- **Padding:** PKCS#1 v1.5 encryption oracles (Bleichenbacher, ROBOT); use OAEP and constant-time decoding.
- **PQC context:** Shor breaks RSA in polynomial time; migrate key exchange first (harvest-now-decrypt-later), signatures by the NIST IR 8547 timeline.`,
    papers: R`### Recommended reading
1. M. Agrawal, N. Kayal, N. Saxena, "PRIMES is in P", *Ann. of Math.* 160 (2004).
2. A. O. L. Atkin, F. Morain, "Elliptic curves and primality proving", *Math. Comp.* 61 (1993).
3. A. K. Lenstra, H. W. Lenstra Jr. (eds.), *The Development of the Number Field Sieve*, LNM 1554 (1993).
4. R. Crandall, C. Pomerance, *Prime Numbers: A Computational Perspective*, 2nd ed. (2005).
5. F. Boudot et al., "Comparing the difficulty of factorization and discrete logarithm: a 240-digit experiment", CRYPTO 2020.
6. C. Gidney, "How to factor 2048 bit RSA integers with less than a million noisy qubits", arXiv:2505.15917 (2025).`,
    lean: R`### Lean 4 / Mathlib status (verify names against current Mathlib docs)
- Nat.Prime is decidable, and norm_num proves primality of explicit numbers.
- Fermat's little theorem and Lucas' primality test are formalized; AKS and the NFS are not in Mathlib.
~~~lean
import Mathlib

example : Nat.Prime 1000003 := by norm_num
#check ZMod.pow_card_sub_one_eq_one   -- Fermat's little theorem
#check lucas_primality
~~~`
  }
};

/* Pre-populated conversation (three exchanges) */
export const SEED_CHAT: SeedChat[] = [
  { role: 'user', md: R`Why does Hasse's bound $|t|\le 2\sqrt p$ hold for an elliptic curve $E/\mathbb{F}_p$?`, ago: 14 },
  { role: 'assistant', topic: 'elliptic', intent: 'intuition', ago: 14 },
  { role: 'user', md: 'Suggest a SageMath script to test this on random curves.', ago: 11 },
  { role: 'assistant', topic: 'elliptic', intent: 'code', ago: 11 },
  { role: 'user', md: 'Recommend papers on the hardness of Module-LWE.', ago: 6 },
  { role: 'assistant', topic: 'lattice', intent: 'papers', ago: 6 }
];
