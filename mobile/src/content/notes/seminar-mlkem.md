# Seminar — Module-LWE and ML-KEM

*PQC reading group · FIPS 203 walkthrough*

## Setting

Let $R_q = \mathbb{Z}_q[x]/(x^{256}+1)$ with $q = 3329$. Since $\zeta=17$ has order $256$ in $\mathbb{F}_{3329}^\times$ and $512\nmid q-1$, the polynomial $x^{256}+1$ splits into $128$ irreducible quadratic factors $x^2 - \zeta^{2\,\mathrm{br}_7(i)+1}$ ($0\le i<128$, $\mathrm{br}_7$ = 7-bit bit reversal), which is what the NTT exploits.

**Module-LWE (decision).** For $\mathbf{A} \leftarrow R_q^{k\times k}$ and $\mathbf{s}, \mathbf{e} \leftarrow \beta_\eta^{k}$,
$$(\mathbf{A},\ \mathbf{A}\mathbf{s} + \mathbf{e}) \ \approx_c\ (\mathbf{A},\ \mathbf{u}), \qquad \mathbf{u} \leftarrow R_q^{k}.$$

## The CPA scheme (K-PKE)

$$\mathbf{t} = \mathbf{A}\mathbf{s} + \mathbf{e},\qquad \mathbf{u} = \mathbf{A}^{\mathsf T}\mathbf{r} + \mathbf{e}_1,\qquad v = \mathbf{t}^{\mathsf T}\mathbf{r} + e_2 + \left\lceil \tfrac{q}{2} \right\rfloor m.$$

> **Lemma.** $v - \mathbf{s}^{\mathsf T}\mathbf{u} = \lceil q/2\rfloor m + \mathbf{e}^{\mathsf T}\mathbf{r} - \mathbf{s}^{\mathsf T}\mathbf{e}_1 + e_2$; decryption is correct whenever the error term has $\ell_\infty$-norm $< \lceil q/4\rfloor = 832$.

| Parameter set | $k$ | $\eta_1$ | NIST category | Failure prob. |
|---|---|---|---|---|
| ML-KEM-512 | 2 | 3 | 1 | $2^{-139}$ |
| ML-KEM-768 | 3 | 2 | 3 | $2^{-164}$ |
| ML-KEM-1024 | 4 | 2 | 5 | $2^{-174}$ |

## Questions for next week

- Why does implicit rejection matter for the IND-CCA proof in the QROM?
- How does the dual attack interact with the compression of $\mathbf{u}$ and $v$?
