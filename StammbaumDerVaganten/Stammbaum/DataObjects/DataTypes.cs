using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    [DataContract]
    public class Reference<T>
    {
        #region IDSpaceManagement
        private static Dictionary<Database, int> NEXT_ID = new Dictionary<Database, int>();

        protected static int GetNextID(Database context, bool claimID)
        {
            if (!NEXT_ID.ContainsKey(context))
            {
                NEXT_ID.Add(context, 0);
            }

            int result = NEXT_ID[context];
            if (claimID)
            {
                NEXT_ID[context]++;
            }
            return result;
        }

        protected static void SetNextID(Database context, int objectID)
        {
            NEXT_ID[context] = objectID;
        }

        private static void UpdateNextID(Database context, int currentObjectID)
        {
            int nextID = GetNextID(context, false);
            int ownSuccessorValue = currentObjectID + 1;
            if (ownSuccessorValue > nextID)
            {
                SetNextID(context, ownSuccessorValue);
            }
        }
        #endregion

        protected Database context = null;
        public Database Context
        {
            get { return context; }
            set
            {
                context = value;
                UpdateNextID(context, objectID);
            }
        }

        [DataMember(Name = "_RAW")]
        protected int objectID = -1;
        public int ObjectID
        {
            get { return objectID; }
            set
            {
                if (objectID != value)
                {
                    objectID = value;
                    UpdateNextID(Context, objectID);
                }
            }
        }

        public Reference()
        { }

        public Reference(Database context = null, int objectID = -1)
        {
            Context = context;
            ObjectID = objectID;
            UpdateNextID(Context, ObjectID);
        }

        public Reference(Database context, bool claimID)
        {
            Context = context;
            if (claimID)
            {
                ObjectID = GetNextID(Context, true);
            }
        }

        private static Reference<T> _invalidTemplate = new Reference<T>();
        public bool IsValid()
        {   
            if (context == _invalidTemplate.Context)
            {
                return false;
            }
            
            if (ObjectID == _invalidTemplate.ObjectID)
            {
                return false;
            }
            
            return true;
        }

        public T GetObject()
        {
            Debug.Assert(IsValid());
            return context.Data.GetObjectFromReference((dynamic)this);
        }

        public override string ToString()
        {
            return typeof(T).Name + " " + objectID;
        }

        public string GetPathString()
        {
            return (context != null ? context.ToString() : "null") + "/" + typeof(T).ToString() + "/" + objectID;
        }
    }

    //Objects without a history but with an id
    [DataContract(Name = "REF_{0}")]
    public class Referenceable<TDerived>
        where TDerived : class
    {
        [DataMember(Name = "_REF")]
        protected VersionedData<Reference<TDerived>> reference = new VersionedData<Reference<TDerived>>();

        public Reference<TDerived> Reference
        {
            get { return reference.Latest; }
            set { reference.Latest = value; }
        }

        [DataMember(Name = "_CL")]
        public VersionedData<CertaintyLevel> Certainty { get; set; }

        public static bool operator ==(Referenceable<TDerived> obj, Reference<TDerived> reference)
        {
            return obj.Reference == reference;
        }

        public static bool operator !=(Referenceable<TDerived> obj, Reference<TDerived> reference)
        {
            return !(obj.Reference == reference);
        }

        public override bool Equals(Object obj)
        {
            if (obj == null)
            {
                return false;
            }
            if (obj.GetType() == this.GetType())
            {
                return obj == this;
            }
            if (obj.GetType() == typeof(Reference<TDerived>))
            {
                return obj == Reference;
            }
            return false;
        }
        public override int GetHashCode() { return GetType().GetHashCode(); }

        public static implicit operator Reference<TDerived>(Referenceable<TDerived> obj)
        {
            return obj.Reference;
        }

        public Referenceable()
        {

        }

        public Referenceable(Database context, bool claimID)
        {
            Reference = new Reference<TDerived>(context, claimID);
        }

        public override string ToString()
        {
            return reference.Latest.ToString();
        }

        public string GetPathString()
        {
            return reference.Latest.GetPathString();
        }
    }

    //check particle(certainty.serialize, actualdata.serialize)
    [DataContract]
    public enum CertaintyLevel
    {
        [EnumMember(Value = "0")]
        None,
        [EnumMember(Value = "1")]
        NoIdea,
        [EnumMember(Value = "3")]
        EstimationBad,
        [EnumMember(Value = "4")]
        EstimationMedium,
        [EnumMember(Value = "5")]
        EstimationGood,
        [EnumMember(Value = "7")]
        Confident,
        [EnumMember(Value = "9")]
        SetInStone
    }

    //Plain old data
    [DataContract(Name = "VD_{0}")]
    public class VersionedData<T>
    {
        [DataContract(Name = "_V")]
        public class Version
        {
            [DataMember(Name = "_T")]
            public DateTime Timestamp { get; set; } = DateTime.Now;
            [DataMember(Name = "_VAL")]
            public T Value { get; set; }

            public Version()
            {
                if (typeof(T) == typeof(string))
                {
                    Value = (dynamic)"";
                    return;
                }
                ConstructorInfo ctor = typeof(T).GetConstructor(Type.EmptyTypes);
                if (ctor != null)
                {
                    Value = (T)ctor.Invoke(new Object[0]);
                    return;
                }
                
                Value = default(T);
            }

            public Version(T value)
                : this()
            {
                Value = value;
            }

            public override string ToString()
            {
                return "[" + Timestamp.ToString() + "] " + Value.ToString();
            }
        }

        [DataMember(Name = "_VERS")]
        public List<Version> Versions { get; set; } = new List<Version>() { new Version() };

        public Version LatestVersion
        {
            get
            {
                return Versions.Last();
            }
            set
            {
                Versions.Add(value);
            }
        }

        public T Latest
        {
            get
            {
                return LatestVersion.Value;
            }
            set
            {
                //Create copy in history
                //I would love to constrain T to IClonable which would be the crappy C# like solution but some types that I need don't implement it
                //so I have to rely on the types to be structs or have their data content flagged mutable. *sigh*
                LatestVersion = new Version(value);
            }
        }

        public void OverwriteLatestValue(T value)
        {
            Versions.Last().Value = value;
        }

        public VersionedData()
        { }

        public VersionedData(T value)
            : this()
        {
            // Bypass creating new version
            OverwriteLatestValue(value);
        }

        public static implicit operator T(VersionedData<T> obj)
        {
            return obj.Latest;
        }

        public override string ToString()
        {
            return LatestVersion.Value.ToString() + " (v" + (Versions.Count() - 1) + " " + LatestVersion.Timestamp.ToString() + ")";
        }
    }

    public class Datapoint<T> : VersionedData<T>
        where T : class
    {
        [DataMember(Name = "_CL")]
        public VersionedData<CertaintyLevel> Certainty { get; set; }

        public Datapoint()
        {

        }
    }

    [DataContract]
    public class Date
    {
        public DateTime Raw { get; set; } = new DateTime();

        public const int VALUE_INVALID = 0;
        protected const int DEFAULT_VALUE = 1;
        protected const int DEFAULT_VALUE_YEAR = 2000;

        #region Accessors
        public int Year
        {
            get { return Raw.Year; }
            set
            {
                if (Raw.Year != value)
                {
                    Raw = Raw.AddYears(value - Raw.Year);
                }
            }
        }

        public int Month
        {
            get { return Raw.Month; }
            set
            {
                if (Raw.Month != value)
                {
                    Raw = Raw.AddMonths(value - Raw.Month);
                }
            }
        }

        public int Day
        {
            get { return Raw.Day; }
            set
            {
                if (Raw.Day != value)
                {
                    Raw = Raw.AddDays(value - Raw.Day);
                }
            }
        }
        #endregion

        public void Set(int year = VALUE_INVALID, int month = VALUE_INVALID, int day = VALUE_INVALID)
        {
            if (year != VALUE_INVALID)
            {
                Year = year;
            }
            if (month != VALUE_INVALID)
            {
                Month = month;
            }
            if (day != VALUE_INVALID)
            {
                Day = day;
            }
        }
        
        public Date()
        {
            Raw = Raw.AddYears(DEFAULT_VALUE_YEAR - Raw.Year);
        }

        public Date(int year, int month = DEFAULT_VALUE, int day = DEFAULT_VALUE)
        {
            Year = year;
            Month = month;
            Day = day;
        }

        public Date(DateTime rawValue)
        {
            Raw = rawValue;
        }

        public static implicit operator DateTime(Date obj)
        {
            return obj.Raw;
        }
    }

    /*[DataContract]
    public class strin
    {
        public string Raw { get; set; } = "";
        
        public strin(string initValue)
        {
            Raw = initValue;
        }
        
        public static implicit operator string(strin obj)
        {
            return obj.Raw;
        }
    }*/
}
