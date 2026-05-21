import Header from '@/components/Header'
import Summary from '@/components/Summary'
import Experience from '@/components/Experience'
import Skills from '@/components/Skills'
import Education from '@/components/Education'
import Certifications from '@/components/Certifications'
import Languages from '@/components/Languages'

export default function Page() {
  return (
    <main className="cv-page">
      <Header />
      <Summary />
      <Experience />
      <Skills />
      <div className="grid grid-cols-2 gap-8">
        <Education />
        <div>
          <Certifications />
          <Languages />
        </div>
      </div>
    </main>
  )
}
