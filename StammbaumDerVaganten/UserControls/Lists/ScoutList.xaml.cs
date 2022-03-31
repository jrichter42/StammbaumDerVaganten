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
    public partial class ScoutList : UserControl
    {
        protected ScoutVm selectedScout;

        public ScoutVm SelectedScout
        {
            get { return selectedScout; }
            set { selectedScout = value; }
        }

        public ScoutList()
        {
            InitializeComponent();
        }
        
        private ScoutVm GetSelectedScout()
        {
            return pfadi_scoutlist.SelectedItem as ScoutVm;
        }

        private void OnSelectedScoutChanged()
        {
            ScoutVm scout = GetSelectedScout();
            //pfadi_membershiplist.Scout = scout;
            //pfadi_activitylist.Scout = scout;
        }

        private void pfadi_scoutlist_AddingNewItem(object sender, AddingNewItemEventArgs e)
        {
            e.NewItem = ((MainViewmodel)DataContext).CreateScout();
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
