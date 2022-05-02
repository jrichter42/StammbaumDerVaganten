using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace StammbaumDerVaganten
{
    public class MainViewmodel : DependencyObject
    {
        public static MainViewmodel ActiveVm = null;

        public static Data ActiveData
        {
            get
            {
                if (ActiveVm is null || ActiveVm.Database is null)
                {
                    return null;
                }

                return ActiveVm.Database.Data;
            }
        }

        //Cast DataContext to MainViewModel with sanity checks
        public static MainViewmodel Cast(object dataContext)
        {
            MainViewmodel vm = dataContext as MainViewmodel;
            Debug.Assert(vm is not null);
            return vm;
        }

        public Database Database;

        public LogVm GlobalLog { get; set; }

        public ObservableCollection<ScoutVm> Scouts { get; set; } = new ObservableCollection<ScoutVm>();
        public ObservableCollection<GroupVm> Groups { get; set; } = new ObservableCollection<GroupVm>();
        public ObservableCollection<RoleVm> Roles { get; set; } = new ObservableCollection<RoleVm>();
        public ObservableCollection<TimepointVm> Timepoints { get; set; } = new ObservableCollection<TimepointVm>();
        //protected ObservableCollection<GroupPhaseVm> selectedGroupPhases;

        public static readonly DependencyProperty ShowIDsProperty =
        DependencyProperty.Register(
            name: "ShowIDs",
            propertyType: typeof(bool),
            ownerType: typeof(UserControl),
            typeMetadata: new FrameworkPropertyMetadata(
                defaultValue: false
            )
        );

        public bool ShowIDs
        {
            get => (bool)GetValue(ShowIDsProperty);
            set => SetValue(ShowIDsProperty, value);
        }

        #region GetStuffByID
        public ScoutVm GetSharedScoutVm(Reference<Scout> scoutRef)
        {
            if (!scoutRef.IsValid())
            {
                return null;
            }

            foreach (ScoutVm s in Scouts)
            {
                if (s.Model.Reference == scoutRef)
                {
                    return s;
                }
            }

            return null;
        }

        public GroupVm GetSharedGroupVm(Reference<Group> groupRef)
        {
            if (!groupRef.IsValid())
            {
                return null;
            }

            foreach (GroupVm g in Groups)
            {
                if (g.Model.Reference == groupRef)
                {
                    return g;
                }
            }

            return null;
        }

        public RoleVm GetSharedRoleVm(Reference<Role> roleRef)
        {
            if (!roleRef.IsValid())
            {
                return null;
            }

            foreach (RoleVm r in Roles)
            {
                if (r.Model.Reference == roleRef)
                {
                    return r;
                }
            }

            return null;
        }

        public TimepointVm GetSharedTimepointVm(Reference<Timepoint> timepointRef)
        {
            if (!timepointRef.IsValid())
            {
                return null;
            }

            foreach (TimepointVm t in Timepoints)
            {
                if (t.Model.Reference == timepointRef)
                {
                    return t;
                }
            }

            return null;
        }
        #endregion

        public ScoutVm CreateScout()
        {
            return ScoutVm.CreateModelAndVmAndAddToLists(Database, Database.Data.Scouts, Scouts) as ScoutVm;
        }

        public GroupVm CreateGroup()
        {
            return GroupVm.CreateModelAndVmInContextAndAddToLists(Database, Database.Data.Groups, Groups) as GroupVm;
        }

        public RoleVm CreateRole()
        {
            return RoleVm.CreateModelAndVmInContextAndAddToLists(Database, Database.Data.Roles, Roles) as RoleVm;
        }

        public TimepointVm CreateTimepoint()
        {
            return TimepointVm.CreateModelAndVmInContextAndAddToLists(Database, Database.Data.Timepoints, Timepoints) as TimepointVm;
        }

        /*public ObservableCollection<GroupPhaseVm> GroupPhases
        {
            get { return selectedGroupPhases; }
            set { selectedGroupPhases = value; }
        }

        public GroupPhaseVm CreateGroupPhase(GroupVm selectedGroup)
        {
            if (selectedGroup is null)
            {
                return null;
            }
            return GroupPhaseVm.Create(selectedGroup.Model.AdditionalPhases, selectedGroup.AdditionalPhases) as GroupPhaseVm;
        }*/

        public MainViewmodel()
        {
            Database = new Database();
            RebuildViewmodels();
        }

        public void Load()
        {
            Log.Global.Write(Log_Level.Message, "Load triggert");
            if (!Database.Load())
            {
                Log.Global.Write(Log_Level.Error, "Failed to load Database");
            }
            else
            {
                Log.Global.Write(Log_Level.Message, "Loaded Data");
            }

            RebuildViewmodels();
        }

        public void Save()
        {
            Log.Global.Write(Log_Level.Message, "Save triggert");
            if (!Database.Save())
            {
                Log.Global.Write(Log_Level.Error, "Failed to save Database");
            }
            else
            {
                Log.Global.Write(Log_Level.Message, "Saved Data");
            }
        }

        public void RebuildViewmodels()
        {
            GlobalLog = new LogVm(Log.Global);
            RebuildViewmodelCollection(Database.Data.Scouts, Scouts);
            RebuildViewmodelCollection(Database.Data.Groups, Groups);
            RebuildViewmodelCollection(Database.Data.Roles, Roles);
            RebuildViewmodelCollection(Database.Data.Timepoints, Timepoints);
        }

        public static void RebuildViewmodelCollection<T, VmT>(List<T> models, ObservableCollection<VmT> viewmodelCollection)
            where T : class, new()
            where VmT : Viewmodel<T>, new()
        {
            if (viewmodelCollection is null)
            {
                return;
            }
            
            viewmodelCollection.Clear();

            for (int i = 0; i < models.Count; i++)
            {
                T model = models[i]; //Why the fuck can't I properly declare something to be reference vs copied in C#. Yes I know these will be classes due to the type constraint but fuck this shit thats ugly to read.
                VmT viewmodel = new VmT();
                viewmodel.Model = model;
                viewmodelCollection.Add(viewmodel);
            }
        }
    }
}
