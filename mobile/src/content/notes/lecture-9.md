# Lecture 9 — From $\zeta(s)$ to Primes in Arithmetic Progressions

*Graduate Analytic Number Theory · Week 5 · prerequisites: Euler products, partial summation*

## 1. The Euler product

For $\Re(s) > 1$, unique factorization in $\mathbb{Z}$ gives the absolutely convergent identity
$$\zeta(s) = \sum_{n=1}^{\infty} \frac{1}{n^s} = \prod_{p \text{ prime}} \frac{1}{1-p^{-s}}.$$
Taking the logarithmic derivative,
$$-\frac{\zeta'}{\zeta}(s) = \sum_{n=1}^{\infty} \frac{\Lambda(n)}{n^s}, \qquad \Lambda(n) = \begin{cases} \log p & n = p^k,\ k \ge 1,\\ 0 & \text{otherwise.}\end{cases}$$

## 2. Characters and orthogonality

A Dirichlet character modulo $q$ is a homomorphism $\chi : (\mathbb{Z}/q\mathbb{Z})^\times \to \mathbb{C}^\times$, extended to $\mathbb{Z}$ by $\chi(n) = 0$ when $\gcd(n,q) > 1$. For $\gcd(a,q)=1$,
$$\frac{1}{\varphi(q)} \sum_{\chi \bmod q} \overline{\chi}(a)\,\chi(n) = \begin{cases} 1 & n \equiv a \pmod q,\\ 0 & \text{otherwise,}\end{cases}$$
so the primes in a progression are isolated by
$$\psi(x;q,a) = \sum_{\substack{n \le x\\ n\equiv a \ (\mathrm{mod}\ q)}} \Lambda(n) = \frac{1}{\varphi(q)}\sum_{\chi \bmod q} \overline{\chi}(a)\,\psi(x,\chi), \qquad \psi(x,\chi)=\sum_{n\le x}\chi(n)\Lambda(n).$$

## 3. Convergence of $L(s,\chi)$ on $\Re(s)>0$

> **Theorem 1.** Let $\chi$ be a non-principal character modulo $q$. Then $L(s,\chi)=\sum_{n\ge1}\chi(n)n^{-s}$ converges for $\Re(s)>0$ and defines a holomorphic function there.

**Proof.** Put $A(x) = \sum_{n \le x}\chi(n)$. By orthogonality the sum of $\chi$ over a complete residue system vanishes, so $|A(x)| \le \varphi(q)$ for all $x$. Partial summation gives, for $\sigma = \Re(s) > 0$ and $N > M \ge 1$,
$$\sum_{M < n \le N} \frac{\chi(n)}{n^{s}} = \frac{A(N)}{N^{s}} - \frac{A(M)}{M^{s}} + s\int_{M}^{N} \frac{A(t)}{t^{s+1}}\,dt,$$
whose modulus is at most $2\varphi(q)M^{-\sigma} + |s|\,\varphi(q)\,\sigma^{-1}M^{-\sigma}$. This tends to $0$ as $M\to\infty$, uniformly on compact subsets of $\{\Re(s)>0\}$, so the partial sums converge locally uniformly and the limit is holomorphic by Weierstrass' theorem. $\blacksquare$

## 4. Non-vanishing at $s=1$

> **Theorem 2 (Dirichlet).** $L(1,\chi) \neq 0$ for every non-principal $\chi$. Consequently, for $\gcd(a,q)=1$,
> $$\sum_{\substack{p \le x \\ p \equiv a \ (\mathrm{mod}\ q)}} \frac{\log p}{p} = \frac{\log x}{\varphi(q)} + O_q(1).$$

*Complex* $\chi$: the product $\prod_{\chi} L(\sigma,\chi)$ has non-negative Dirichlet coefficients and is $\ge 1$ for $\sigma > 1$, which rules out a zero at $s=1$ shared by $\chi$ and $\overline{\chi}$. *Real* $\chi$: if $\chi$ is induced by the primitive real character $\chi_d$, then $L(1,\chi)=L(1,\chi_d)\prod_{p\mid q}(1-\chi_d(p)/p)$ with all factors nonzero, and for $\chi_d$ the class number formula
$$L(1,\chi_d)=\begin{cases}\dfrac{2\pi\, h(d)}{w_d\sqrt{|d|}} & d<0,\\[3mm] \dfrac{2\,h(d)\log\varepsilon_d}{\sqrt d} & d>0 \ (\varepsilon_d>1 \text{ the fundamental unit}),\end{cases}$$
exhibits $L(1,\chi_d)$ as a positive quantity.

## 5. Numerical experiment

The formula predicts $h(-23)=3$, that is $L(1,\chi_{-23}) = 3\pi/\sqrt{23} \approx 1.9652$.

```python
# Pure Python: approximate L(1, chi_d) and recover h(d) from the class number formula
from math import pi, sqrt

def jacobi(a, n):
    """Jacobi symbol (a/n) for odd n > 0."""
    a %= n
    result = 1
    while a:
        while a % 2 == 0:
            a //= 2
            if n % 8 in (3, 5):
                result = -result
        a, n = n, a
        if a % 4 == 3 and n % 4 == 3:
            result = -result
        a %= n
    return result if n == 1 else 0

def kronecker(d, n):
    """Kronecker symbol (d/n) for n >= 1, i.e. the real character chi_d."""
    e = 0
    while n % 2 == 0:
        n //= 2
        e += 1
    two = 0 if d % 2 == 0 else (1 if d % 8 in (1, 7) else -1)
    return two ** e * jacobi(d, n)

d, N = -23, 2_000_000
L1 = sum(kronecker(d, n) / n for n in range(1, N + 1))
w = 6 if d == -3 else 4 if d == -4 else 2
print(f"L(1, chi_{d}) ~ {L1:.6f}")                           # 1.965203
print(f"h({d}) ~ {L1 * w * sqrt(abs(d)) / (2 * pi):.4f}")    # 3.0000
```

```sage
# SageMath cross-check
K.<a> = QuadraticField(-23)
print(K.class_number())      # 3
print(K.class_group())
```

## 6. Exercises

1. Show that $\prod_{\chi \bmod q} L(s,\chi) = \zeta_{\mathbb{Q}(\zeta_q)}(s)\cdot\prod_{p\mid q}(\text{finite Euler factors})$ and deduce the non-vanishing for complex $\chi$ from the simple pole of $\zeta_{\mathbb{Q}(\zeta_q)}$ at $s=1$.
2. Prove the Pólya–Vinogradov inequality $\big|\sum_{M<n\le M+N}\chi(n)\big| \ll \sqrt{q}\log q$ for primitive $\chi$, using Gauss sums $\tau(\chi)=\sum_{a \bmod q}\chi(a)e^{2\pi i a/q}$ with $|\tau(\chi)|=\sqrt q$.
3. Compute $\#\{p \le 10^6 : p \equiv a \pmod{7}\}$ for each $a$ and compare with $\pi(10^6)/6$.
