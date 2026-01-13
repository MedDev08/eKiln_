import * as React from 'react';
import SidebarChef from '../components/layout/SidebarChef';
import Enfourneur from './Chargement/Enfourneur';
function ChargementContent() {
  return (
  <SidebarChef initialPath="/ChargementContent">
  <Enfourneur/>
  </SidebarChef>
  )
}
export default ChargementContent;
