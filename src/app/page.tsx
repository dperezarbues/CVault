import Header from '@/components/Header'
import Summary from '@/components/Summary'
import Experience from '@/components/Experience'
import Awards from '@/components/Awards'
import Skills from '@/components/Skills'
import Education from '@/components/Education'
import Certifications from '@/components/Certifications'
import Languages from '@/components/Languages'
import SideProjects from '@/components/SideProjects'

export default function Page() {
  return (
    <main id="cv-content" className="cv-page">
      <Header />
      <Summary />
      <Experience />
      <Awards />
      <Skills />
      <div className="grid grid-cols-2 gap-8">
        <div>
          <Education />
          <Languages />
        </div>
        <Certifications />
      </div>
      <SideProjects />
    </main>
  )
}
