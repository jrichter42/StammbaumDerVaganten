using System.Windows;
using System.Windows.Input;
using MahApps.Metro.Controls;
using System.Windows.Controls;

namespace StammbaumDerVaganten
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : MetroWindow
    {
        MainViewModel vm;

        public MainWindow()
        {
            InitializeComponent();
            vm = (MainViewModel)DataContext;
            MainViewModel.ActiveVM = vm;

            Load(this, null);

            if (Keyboard.PrimaryDevice.IsKeyDown(Key.Escape))
            {
                Application.Current.Shutdown();
            }
        }

       

        private void Load(object sender, ExecutedRoutedEventArgs e)
        {
            vm.Load();
            pfadi_rolelist.ItemsSource = vm.Roles;
            pfadi_timepointlist.ItemsSource = vm.Timepoints;
            pfadi_grouplist.ItemsSource = vm.Groups;

            advanced_scoutlist.pfadi_scoutlist.ItemsSource = vm.Scouts;
            OnScoutSelectionChanged();

            pfadi_basic_timepointlist.ItemsSource = vm.Timepoints;
            pfadi_basic_grouplist.ItemsSource = vm.Groups;

        }

        private void Save(object sender, ExecutedRoutedEventArgs e)
        {
            vm.Save();
        }

        private void OnScoutSelectionChanged()
        {
            /*ScoutVm scout = GetSelectedScout();

            vm.RebuildSelectedScoutViewmodels(scout);

            pfadi_membershiplist.ItemsSource = vm.Memberships;
            pfadi_activitylist.ItemsSource = vm.Activities;*/
        }

        private void pfadi_rolelist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = vm.CreateRole();
        }

        private void pfadi_timepointlist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = vm.CreateTimepoint();
        }

        private void pfadi_basic_timepointlist_AddingNewItem(object sender, AddingNewItemEventArgs e)
        {
            e.NewItem = vm.CreateTimepoint();
        }

        private void pfadi_grouplist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = vm.CreateGroup();
        }

        private void pfadi_basic_grouplist_AddingNewItem(object sender, AddingNewItemEventArgs e)
        {
            e.NewItem = vm.CreateGroup();
        }

        private void pfadi_additionalphaseslist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = new GroupPhase();
        }

        private void pfadi_scoutlist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = vm.CreateScout();
        }

        private void pfadi_membershiplist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            //e.NewItem = vm.CreateMembership(GetSelectedScout());
        }

        private void pfadi_activitylist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            //e.NewItem = vm.CreateActivity(GetSelectedScout());
        }

        private void pfadi_scoutlist_DataContextChanged(object sender, DependencyPropertyChangedEventArgs e)
        {
            OnScoutSelectionChanged();
        }

        private void pfadi_scoutlist_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
        {
            OnScoutSelectionChanged();
        }

        bool manualCommit = false;
        private void pfadi_list_CellEditEnding(object sender, System.Windows.Controls.DataGridCellEditEndingEventArgs e)
        {
            if (!manualCommit)
            {
                manualCommit = true;
                DataGrid grid = (DataGrid)sender;
                grid.CommitEdit(DataGridEditingUnit.Row, true);
                manualCommit = false;
            }
        }

        private void pfadi_timepointlist_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {
            pfadi_list_CellEditEnding(sender, e);

            //Hack to make different levels of PropertyChanged update each other without resolving the actual issue
            if ((string)e.Column.Header == "Datum")
            {
                pfadi_grouplist.ItemsSource = vm.Groups;
                pfadi_basic_grouplist.ItemsSource = vm.Groups;
                OnScoutSelectionChanged();
            }
        }

        private void pfadi_basic_timepointlist_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {
            pfadi_list_CellEditEnding(sender, e);

            //Hack to make different levels of PropertyChanged update each other without resolving the actual issue
            if ((string)e.Column.Header == "Datum")
            {
                pfadi_grouplist.ItemsSource = vm.Groups;
                pfadi_basic_grouplist.ItemsSource = vm.Groups;
                OnScoutSelectionChanged();
            }
        }
    }
}
