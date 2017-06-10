using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace StammbaumDerVaganten
{
    /// <summary>
    /// Interaction logic for Scoutlist.xaml
    /// </summary>
    public partial class Scoutlist : UserControl
    {
        protected ScoutVm selectedScout;

        public ScoutVm SelectedScout
        {
            get { return selectedScout; }
            set { selectedScout = value; }
        }

        public Scoutlist()
        {
            InitializeComponent();
            pfadi_scoutlist.ItemsSource = MainViewmodel.ActiveVm.Scouts;
        }
        
        private ScoutVm GetSelectedScout()
        {
            ScoutVm scout = null;

            MainViewmodel vm = MainViewmodel.ActiveVm;

            int idx = pfadi_scoutlist.SelectedIndex;
            if (vm != null && vm.Scouts != null && idx != -1 && vm.Scouts != null && idx < vm.Scouts.Count)
            {
                scout = vm.Scouts[idx];
            }

            return scout;
        }

        private void OnSelectedScoutChanged()
        {
            ScoutVm scout = GetSelectedScout();
            //pfadi_membershiplist.Scout = scout;
            //pfadi_activitylist.Scout = scout;
        }

        private void pfadi_scoutlist_AddingNewItem(object sender, AddingNewItemEventArgs e)
        {
            e.NewItem = MainViewmodel.ActiveVm.CreateScout();
        }

        private void pfadi_scoutlist_DataContextChanged(object sender, DependencyPropertyChangedEventArgs e)
        {
            OnSelectedScoutChanged();
        }

        private void pfadi_scoutlist_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            OnSelectedScoutChanged();
        }

        private void pfadi_scoutlist_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {
            ListHelper.DataGrid_CellEditEnding(sender, e);
        }
    }
}
